from fastapi import APIRouter, Form, HTTPException
from pydantic import BaseModel
from services.rag_engine import get_customer_response
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])

class QueryRequest(BaseModel):
    customer_id: str
    query: str

@router.post("/")
async def query_documents(req: QueryRequest):
    if not req.customer_id or not req.query:
        raise HTTPException(status_code=400, detail="customer_id and query are required")
        
    try:
        # Retrieve the relevant chunks securely and ask the LLM
        response_text = get_customer_response(req.customer_id, req.query)
        
        return {
            "status": "success",
            "customer_id": req.customer_id,
            "response": response_text
        }
    except Exception as e:
        logger.error("Error processing query for customer %s: %s", req.customer_id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
