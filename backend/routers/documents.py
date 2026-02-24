"""Document upload and management endpoints.

All uploads are authenticated and scoped to the customer's namespace.
"""
import logging
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Request, UploadFile

from models.schemas import UploadResponse
from services.document_parser import parse_document
from services.rag_engine import process_and_store_documents

logger = logging.getLogger("avicon.documents")

router = APIRouter(prefix="/documents", tags=["documents"])

TEMP_DIR = Path("/tmp/avicon_uploads")
TEMP_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".xlsx", ".pptx", ".csv", ".txt", ".md"}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
):
    """Upload and process a document into the customer's RAG namespace.

    Authentication is handled by JWT middleware — customer_id comes from the token.
    """
    # Get authenticated customer_id from middleware
    customer_id = getattr(request.state, "customer_id", None)
    if not customer_id:
        raise HTTPException(status_code=401, detail="Authentication required")

    # Validate file extension
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type '{ext}' not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read and validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")

    # Save to temp with unique name to prevent collisions
    safe_filename = f"{uuid.uuid4().hex}_{Path(filename).stem}{ext}"
    temp_path = TEMP_DIR / safe_filename

    try:
        with open(temp_path, "wb") as buffer:
            buffer.write(contents)

        # Parse document
        docs = await parse_document(str(temp_path), customer_id)

        # Chunk and embed to Pinecone
        num_chunks = process_and_store_documents(docs, customer_id)

        logger.info(f"UPLOAD_SUCCESS | customer={customer_id} | file={filename} | chunks={num_chunks}")

        return UploadResponse(
            filename=filename,
            customer_id=customer_id,
            chunks_created=num_chunks,
            message=f"Successfully processed and embedded {num_chunks} chunks",
        )

    except Exception as e:
        logger.error(f"UPLOAD_ERROR | customer={customer_id} | file={filename} | error={e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process document")
    finally:
        if temp_path.exists():
            temp_path.unlink()
