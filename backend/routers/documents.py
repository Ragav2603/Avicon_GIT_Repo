"""Document upload and management endpoints.

All uploads are authenticated and scoped to the customer's namespace.
"""

import logging
import re
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
            detail=f"File type '{ext}' not allowed. Supported: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Sanitize filename (keep only alphanumeric, dash, underscore)
    original_stem = Path(filename).stem
    safe_stem = re.sub(r"[^a-zA-Z0-9_\-]", "_", original_stem)

    # Save to temp with unique name to prevent collisions
    safe_filename = f"{uuid.uuid4().hex}_{safe_stem}{ext}"
    temp_path = TEMP_DIR / safe_filename

    try:
        # Stream file to disk to prevent memory exhaustion (DoS)
        size = 0
        CHUNK_SIZE = 1024 * 1024  # 1MB

        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400, detail="File size exceeds 50MB limit"
                    )
                buffer.write(chunk)

        # Parse document
        docs = await parse_document(str(temp_path), customer_id)

        # Chunk and embed to Pinecone
        num_chunks = process_and_store_documents(docs, customer_id)

        logger.info(
            f"UPLOAD_SUCCESS | customer={customer_id} | file={filename} | chunks={num_chunks}"
        )

        return UploadResponse(
            filename=filename,
            customer_id=customer_id,
            chunks_created=num_chunks,
            message=f"Successfully processed and embedded {num_chunks} chunks",
        )

    except HTTPException:
        # Re-raise HTTP exceptions (like our 400) directly
        raise
    except Exception as e:
        logger.error(
            f"UPLOAD_ERROR | customer={customer_id} | file={filename} | error={e}",
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail="Failed to process document")
    finally:
        if temp_path.exists():
            temp_path.unlink()
