from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from services.rag_engine import stream_project_response
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/query", tags=["query"])

class QueryRequest(BaseModel):
    project_id: str
    query: str

@router.post("/")
async def query_documents(req: QueryRequest):
    if not req.project_id or not req.query:
        raise HTTPException(status_code=400, detail="project_id and query are required")
        
    try:
        # Return a streaming response to show reasoning trace and LLM chunks
        return StreamingResponse(
            stream_project_response(req.project_id, req.query),
            media_type="text/event-stream"
        )
    except Exception as e:
        logger.error("Error processing query for project %s: %s", req.project_id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
