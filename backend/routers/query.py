"""RAG query endpoints.

All queries are authenticated and strictly scoped to the customer's Pinecone namespace.
"""
import logging

from fastapi import APIRouter, Request, HTTPException

from models.schemas import QueryRequest, QueryResponse
from services.rag_engine import get_customer_response

logger = logging.getLogger("avicon.query")

router = APIRouter(prefix="/query", tags=["query"])


@router.post("/", response_model=QueryResponse)
async def query_knowledge_base(request: Request, body: QueryRequest):
    """Query the customer's RAG knowledge base.

    The customer_id is ALWAYS derived from the JWT — never from user input.
    This enforces strict multi-tenant isolation at the API level.
    """
    customer_id = getattr(request.state, "customer_id", None)
    if not customer_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        result = get_customer_response(
            customer_id=customer_id,
            query=body.query,
        )

        return QueryResponse(
            customer_id=customer_id,
            query=body.query,
            response=result["response"],
            sources=result["sources"],
            latency_ms=result["latency_ms"],
            cached=result["cached"],
        )

    except Exception as e:
        logger.error(f"QUERY_ERROR | customer={customer_id} | error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process query")
