"""RAG Engine — LangChain LCEL with Azure OpenAI + Pinecone.

Phase 2: Full async support, embedding caching, optimized LCEL chains.
Namespace-based multi-tenancy ensures strict customer isolation.
"""
import hashlib
import logging
import os
import threading
import time
from collections import OrderedDict
from typing import Any, Dict, List, Optional

from langchain_core.documents import Document
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import MarkdownHeaderTextSplitter

from services.pii_masker import mask_pii

logger = logging.getLogger("avicon.rag")


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
        """Create a key that allows efficient per-customer invalidation."""
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
        """Invalidate all cache entries for a customer (e.g., after document upload)."""
        prefix = f"{customer_id}:"
        with self._lock:
            keys_to_remove = [k for k in self._cache.keys() if k.startswith(prefix)]
            for key in keys_to_remove:
                del self._cache[key]
        if keys_to_remove:
            logger.info(f"CACHE_INVALIDATE | customer={customer_id} | entries={len(keys_to_remove)}")


_query_cache = QueryCache(max_size=500, ttl_seconds=300)


# ──────────────────────────────────────────────────
# Singleton-cached Azure OpenAI components
# ──────────────────────────────────────────────────
_embeddings_instance: Optional[AzureOpenAIEmbeddings] = None
_llm_instance: Optional[AzureChatOpenAI] = None


def _get_embeddings() -> AzureOpenAIEmbeddings:
    global _embeddings_instance
    if _embeddings_instance is None:
        _embeddings_instance = AzureOpenAIEmbeddings(
            api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
            azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
            azure_deployment=os.environ.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-ada-002"),
            openai_api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
        )
    return _embeddings_instance


def _get_llm() -> AzureChatOpenAI:
    global _llm_instance
    if _llm_instance is None:
        _llm_instance = AzureChatOpenAI(
            api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
            azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
            azure_deployment=os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o"),
            openai_api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
            temperature=0,
            max_retries=2,
            request_timeout=30,
        )
    return _llm_instance


def _get_vectorstore(namespace: str) -> PineconeVectorStore:
    """Get Pinecone vector store STRICTLY scoped to a customer namespace."""
    return PineconeVectorStore(
        index_name=os.environ.get("PINECONE_INDEX_NAME", "my-ai-agents"),
        embedding=_get_embeddings(),
        namespace=namespace,
        pinecone_api_key=os.environ.get("PINECONE_API_KEY"),
    )


# ──────────────────────────────────────────────────
# Optimized LCEL Prompt
# ──────────────────────────────────────────────────
_RAG_PROMPT = ChatPromptTemplate.from_template(
    "You are an enterprise AI assistant for the Avicon aviation procurement platform. "
    "Answer the following question based ONLY on the provided context documents. "
    "If the context doesn't contain enough information, say so clearly. "
    "Be precise, professional, and cite specific details from the context when possible.\n\n"
    "Context:\n{context}\n\n"
    "Question: {question}\n\n"
    "Answer:"
)


def _format_docs(docs: list) -> str:
    """Format retrieved documents with source attribution."""
    formatted = []
    for i, doc in enumerate(docs, 1):
        source = doc.metadata.get("source", "unknown")
        header = doc.metadata.get("Header 1", "")
        prefix = f"[Source {i}: {source}"
        if header:
            prefix += f" > {header}"
        prefix += "]"
        formatted.append(f"{prefix}\n{doc.page_content}")
    return "\n\n---\n\n".join(formatted)


def _extract_sources(docs: list) -> List[Dict[str, Any]]:
    """Extract source metadata from retrieved documents."""
    sources = []
    seen = set()
    for doc in docs:
        source_name = doc.metadata.get("source", "unknown")
        if source_name not in seen:
            seen.add(source_name)
            sources.append({
                "source": source_name,
                "headers": [
                    doc.metadata.get("Header 1", ""),
                    doc.metadata.get("Header 2", ""),
                ],
            })
    return sources


# ──────────────────────────────────────────────────
# Document Processing (sync — called by upload endpoint)
# ──────────────────────────────────────────────────
def process_and_store_documents(documents: List[Document], customer_id: str) -> int:
    """Chunk markdown documents and push to Pinecone under the customer namespace."""
    headers_to_split_on = [
        ("#", "Header 1"),
        ("##", "Header 2"),
        ("###", "Header 3"),
    ]
    splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)

    chunked_docs = []
    for doc in documents:
        splits = splitter.split_text(doc.page_content)
        for split in splits:
            combined_metadata = {**doc.metadata, **split.metadata}
            combined_metadata["customer_id"] = customer_id
            chunked_docs.append(
                Document(page_content=split.page_content, metadata=combined_metadata)
            )

    if chunked_docs:
        vectorstore = _get_vectorstore(namespace=customer_id)
        vectorstore.add_documents(chunked_docs)
        logger.info(f"INGEST | customer={customer_id} | chunks={len(chunked_docs)}")

    # Invalidate query cache for this customer after new documents
    _query_cache.invalidate_customer(customer_id)

    return len(chunked_docs)


# ──────────────────────────────────────────────────
# Async RAG Query (Phase 2: fully async)
# ──────────────────────────────────────────────────
async def get_customer_response(
    customer_id: str,
    query: str,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """Execute async RAG query strictly scoped to customer_id namespace.

    Returns dict with 'response', 'sources', 'latency_ms', 'cached'.
    """
    start = time.time()

    # PII-mask the query before sending to LLM
    masked_query = mask_pii(query)

    # Check cache
    if use_cache:
        cached = _query_cache.get(customer_id, masked_query)
        if cached is not None:
            cached["latency_ms"] = round((time.time() - start) * 1000, 2)
            cached["cached"] = True
            return cached

    # SECURE RETRIEVAL: Bound strictly to the customer's namespace
    vectorstore = _get_vectorstore(namespace=customer_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    llm = _get_llm()

    # Async LCEL chain invocation
    chain = (
        {"context": retriever | _format_docs, "question": RunnablePassthrough()}
        | _RAG_PROMPT
        | llm
        | StrOutputParser()
    )

    # Use ainvoke for non-blocking execution
    response_text = await chain.ainvoke(masked_query)

    # Extract source metadata from retriever
    retrieved_docs = await retriever.ainvoke(masked_query)
    sources = _extract_sources(retrieved_docs)

    latency = round((time.time() - start) * 1000, 2)

    result = {
        "response": response_text,
        "sources": sources,
        "latency_ms": latency,
        "cached": False,
    }

    # Cache the result
    if use_cache:
        _query_cache.set(customer_id, masked_query, result)

    logger.info(f"RAG_QUERY | customer={customer_id} | latency={latency}ms | sources={len(sources)}")
    return result
