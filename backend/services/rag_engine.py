"""RAG Engine — LlamaIndex Vectorless Tree Index with Azure OpenAI.

Phase 3: Hierarchical Document Structuring for long aviation RFP analysis.
"""
import hashlib
import logging
import os
import threading
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional

from llama_index.core import Document, TreeIndex, Settings
from llama_index.core.node_parser import MarkdownNodeParser
from llama_index.core.retrievers import TreeSelectLeafRetriever
from llama_index.llms.azure_openai import AzureOpenAI
from llama_index.embeddings.azure_openai import AzureOpenAIEmbedding

from services.pii_masker import mask_pii

logger = logging.getLogger("avicon.rag")

# ──────────────────────────────────────────────────
# Global Settings Config for LlamaIndex
# ──────────────────────────────────────────────────

def _configure_llama_index():
    """Set global Azure LLM and Embeddings for LlamaIndex."""
    if getattr(Settings, "_avicon_configured", False):
        return

    Settings.llm = AzureOpenAI(
        model="gpt-4o",
        deployment_name=os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o"),
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
        temperature=0.1
    )
    
    Settings.embed_model = AzureOpenAIEmbedding(
        model="text-embedding-ada-002",
        deployment_name=os.environ.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-ada-002"),
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
    )
    
    Settings._avicon_configured = True


# ──────────────────────────────────────────────────
# LRU Cache for query results (thread-safe)
# ──────────────────────────────────────────────────
class QueryCache:
    """Thread-safe LRU cache for RAG query results with TTL."""

    def __init__(self, max_size: int = 500, ttl_seconds: int = 300):
        self._cache: OrderedDict[str, dict] = OrderedDict()
        self._max_size = max(1, max_size)
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def _make_key(self, customer_id: str, query: str) -> str:
        query_hash = hashlib.sha256(query.strip().lower().encode()).hexdigest()
        return f"{customer_id}:{query_hash}"

    def get(self, customer_id: str, query: str) -> Optional[dict]:
        key = self._make_key(customer_id, query)
        with self._lock:
            if key in self._cache:
                entry = self._cache[key]
                if time.time() - entry["ts"] < self._ttl:
                    self._cache.move_to_end(key)
                    logger.info(f"CACHE_HIT | customer={customer_id}")
                    return entry["data"]
                else:
                    del self._cache[key]
        return None

    def set(self, customer_id: str, query: str, data: dict):
        key = self._make_key(customer_id, query)
        with self._lock:
            if key in self._cache:
                self._cache.move_to_end(key)
            elif len(self._cache) >= self._max_size:
                self._cache.popitem(last=False)
            self._cache[key] = {"data": data, "ts": time.time()}

    def invalidate_customer(self, customer_id: str):
        prefix = f"{customer_id}:"
        with self._lock:
            keys_to_remove = [k for k in self._cache.keys() if k.startswith(prefix)]
            for key in keys_to_remove:
                del self._cache[key]
        if keys_to_remove:
            logger.info(f"CACHE_INVALIDATE | customer={customer_id} | entries={len(keys_to_remove)}")


_query_cache = QueryCache(max_size=500, ttl_seconds=300)


# ──────────────────────────────────────────────────
# In-Memory Customer Document Stores (For Tree RAG)
# ──────────────────────────────────────────────────
# Given the move from Pinecone to Tree structured JSON, we temporarily store trees in memory per-customer.
# In a robust production environment, this would be serialized to Redis or LlamaCloud.
_customer_indexes: Dict[str, TreeIndex] = {}
_index_lock = threading.Lock()

def _get_customer_index(customer_id: str) -> Optional[TreeIndex]:
    with _index_lock:
        return _customer_indexes.get(customer_id)

def _get_llm():
    """Return the configured Azure OpenAI LLM instance for direct prompting."""
    _configure_llama_index()
    return Settings.llm


def _get_customer_index(customer_id: str) -> Optional[TreeIndex]:
    with _index_lock:
        return _customer_indexes.get(customer_id)

def _set_customer_index(customer_id: str, index: TreeIndex):
    with _index_lock:
        _customer_indexes[customer_id] = index


# ──────────────────────────────────────────────────
# Document Processing (sync — called by upload endpoint)
# ──────────────────────────────────────────────────
def process_and_store_documents(documents: List[Any], customer_id: str) -> int:
    """Take raw texts, cast them to LlamaIndex Documents, and build a TreeIndex."""
    _configure_llama_index()
    
    # 1. Convert incoming documents (from Langchain format parser) to LlamaIndex Docs
    llama_docs = []
    for d in documents:
        # Check if it's already a string or a Langchain Document object
        content = getattr(d, "page_content", str(d))
        meta = getattr(d, "metadata", {})
        meta["customer_id"] = customer_id
        llama_docs.append(Document(text=content, metadata=meta))

    # 2. Node Parsing (Hierarchical extraction rather than flat char chunking)
    parser = MarkdownNodeParser()
    nodes = parser.get_nodes_from_documents(llama_docs)
    
    # 3. Build Vectorless Tree (Summary-based parent-child traversal)
    # The TreeIndex uses the LLM to summarize nodes and build a navigation tree
    logger.info(f"BUILDING_TREE | customer={customer_id} | nodes={len(nodes)}")
    index = TreeIndex(nodes)
    
    _set_customer_index(customer_id, index)
    
    # Invalidate query cache for this customer after new documents
    _query_cache.invalidate_customer(customer_id)

    return len(nodes)


# ──────────────────────────────────────────────────
# Async RAG Query (Phase 3: Tree Node Traversal)
# ──────────────────────────────────────────────────
async def get_customer_response(
    customer_id: str,
    query: str,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """Execute async RAG query using TreeIndex logic.

    Returns dict with 'response', 'sources', 'latency_ms', 'cached'.
    """
    start = time.time()
    _configure_llama_index()

    masked_query = mask_pii(query)

    if use_cache:
        cached = _query_cache.get(customer_id, masked_query)
        if cached is not None:
            cached["latency_ms"] = round((time.time() - start) * 1000, 2)
            cached["cached"] = True
            return cached

    # RETRIEVE IN-MEMORY TREE INDEX
    index = _get_customer_index(customer_id)
    if not index:
        return {
            "response": "I do not have any documents loaded in the system to answer your question.",
            "sources": [],
            "latency_ms": round((time.time() - start) * 1000, 2),
            "cached": False,
        }

    # HIERARCHICAL REASONING ENGINE (Vectorless Traversal)
    # Convert to standard Query Engine
    prompt = (
        "You are an enterprise AI assistant for the Avicon aviation procurement platform. "
        "1. DEPENDENCY: Answer based ONLY on the provided context.\n"
        "2. NO HALLUCINATION: Do not guess or extrapolate.\n"
        "3. DEFINITION OF DONE: Your final answer must be a clear, actionable summary."
    )
    
    query_engine = index.as_query_engine(
        retriever_mode="select_leaf",
        child_branch_factor=3,
        system_prompt=prompt,
        response_mode="tree_summarize" # Aggregate leaf responses together effectively
    )

    response_obj = await query_engine.aquery(masked_query)

    # Extract source metadata matching our standardized frontend schema
    sources = []
    seen = set()
    for node_w_score in response_obj.source_nodes:
        node = node_w_score.node
        source_name = node.metadata.get("source", "unknown")
        if source_name not in seen:
            seen.add(source_name)
            sources.append({
                "source": source_name,
                "headers": [
                    node.metadata.get("Header 1", ""),
                    node.metadata.get("Header 2", "")
                ]
            })

    latency = round((time.time() - start) * 1000, 2)
    result = {
        "response": str(response_obj),
        "sources": sources,
        "latency_ms": latency,
        "cached": False,
    }

    if use_cache:
        _query_cache.set(customer_id, masked_query, result)

    logger.info(f"RAG_QUERY | customer={customer_id} | latency={latency}ms | sources={len(sources)}")
    return result
