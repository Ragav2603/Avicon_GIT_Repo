"""RAG Engine — LangChain LCEL with Azure OpenAI + Pinecone.

Namespace-based multi-tenancy ensures strict customer isolation.
Every query is scoped by customer_id at the vector database level.
"""
import os
import time
import logging
import hashlib
from typing import Optional, List, Dict, Any
from collections import OrderedDict

from langchain_core.documents import Document
from langchain_openai import AzureOpenAIEmbeddings, AzureChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

from services.pii_masker import mask_pii

logger = logging.getLogger("avicon.rag")


# ──────────────────────────────────────────────
# LRU Cache for query results
# ──────────────────────────────────────────────
class QueryCache:
    """Simple LRU cache for RAG query results."""

    def __init__(self, max_size: int = 200, ttl_seconds: int = 300):
        self._cache: OrderedDict[str, dict] = OrderedDict()
        self._max_size = max_size
        self._ttl = ttl_seconds

    def _make_key(self, customer_id: str, query: str) -> str:
        raw = f"{customer_id}:{query.strip().lower()}"
        return hashlib.sha256(raw.encode()).hexdigest()

    def get(self, customer_id: str, query: str) -> Optional[str]:
        key = self._make_key(customer_id, query)
        if key in self._cache:
            entry = self._cache[key]
            if time.time() - entry["ts"] < self._ttl:
                self._cache.move_to_end(key)
                logger.info(f"CACHE_HIT | customer={customer_id}")
                return entry["response"]
            else:
                del self._cache[key]
        return None

    def set(self, customer_id: str, query: str, response: str):
        key = self._make_key(customer_id, query)
        if len(self._cache) >= self._max_size:
            self._cache.popitem(last=False)
        self._cache[key] = {"response": response, "ts": time.time()}


_query_cache = QueryCache()


# ──────────────────────────────────────────────
# Vector Store Initialization
# ──────────────────────────────────────────────
def _get_embeddings() -> AzureOpenAIEmbeddings:
    return AzureOpenAIEmbeddings(
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        azure_deployment=os.environ.get("AZURE_OPENAI_EMBEDDING_DEPLOYMENT", "text-embedding-ada-002"),
        openai_api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
    )


def _get_vectorstore(namespace: str) -> PineconeVectorStore:
    """Get Pinecone vector store STRICTLY scoped to a customer namespace."""
    return PineconeVectorStore(
        index_name=os.environ.get("PINECONE_INDEX_NAME", "my-ai-agents"),
        embedding=_get_embeddings(),
        namespace=namespace,
        pinecone_api_key=os.environ.get("PINECONE_API_KEY"),
    )


def _get_llm() -> AzureChatOpenAI:
    return AzureChatOpenAI(
        api_key=os.environ.get("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.environ.get("AZURE_OPENAI_ENDPOINT"),
        azure_deployment=os.environ.get("AZURE_OPENAI_DEPLOYMENT", "gpt-4o"),
        openai_api_version=os.environ.get("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
        temperature=0,
    )


# ──────────────────────────────────────────────
# Document Processing
# ──────────────────────────────────────────────
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
            # Always enforce customer_id in metadata
            combined_metadata["customer_id"] = customer_id
            chunked_docs.append(
                Document(page_content=split.page_content, metadata=combined_metadata)
            )

    if chunked_docs:
        vectorstore = _get_vectorstore(namespace=customer_id)
        vectorstore.add_documents(chunked_docs)
        logger.info(f"INGEST | customer={customer_id} | chunks={len(chunked_docs)}")

    return len(chunked_docs)


# ──────────────────────────────────────────────
# RAG Query
# ──────────────────────────────────────────────
def _format_docs(docs: list) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


def get_customer_response(
    customer_id: str,
    query: str,
    use_cache: bool = True,
) -> Dict[str, Any]:
    """Execute RAG query strictly scoped to customer_id namespace.

    Returns dict with 'response', 'sources', 'latency_ms', 'cached'.
    """
    start = time.time()

    # PII-mask the query before sending to LLM
    masked_query = mask_pii(query)

    # Check cache
    if use_cache:
        cached = _query_cache.get(customer_id, masked_query)
        if cached is not None:
            return {
                "response": cached,
                "sources": [],
                "latency_ms": round((time.time() - start) * 1000, 2),
                "cached": True,
            }

    # SECURE RETRIEVAL: Bound strictly to the customer's namespace
    vectorstore = _get_vectorstore(namespace=customer_id)
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    llm = _get_llm()

    prompt = ChatPromptTemplate.from_template(
        "You are an enterprise AI assistant for Avicon. "
        "Answer the following question based ONLY on the provided context. "
        "If the context doesn't contain enough information, say so clearly.\n\n"
        "Context:\n{context}\n\n"
        "Question: {question}\n\n"
        "Provide a clear, professional answer:"
    )

    # Pure LCEL chain
    chain = (
        {"context": retriever | _format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    response_text = chain.invoke(masked_query)

    latency = round((time.time() - start) * 1000, 2)

    # Cache the result
    if use_cache:
        _query_cache.set(customer_id, masked_query, response_text)

    logger.info(f"RAG_QUERY | customer={customer_id} | latency={latency}ms")

    return {
        "response": response_text,
        "sources": [],
        "latency_ms": latency,
        "cached": False,
    }
