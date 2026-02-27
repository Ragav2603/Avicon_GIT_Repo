from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import os
import logging
from typing import List
from services.document_parser import parse_document
from services.rag_engine import process_and_store_documents

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/upload", tags=["upload"])

# Security constants
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/")
async def upload_document(
    project_id: str = Form(...),
    file: UploadFile = File(...)
):
    if not project_id:
        raise HTTPException(status_code=400, detail="project_id is required")

    if not file.filename:
         raise HTTPException(status_code=400, detail="Filename is missing")

    # 1. Validate File Extension
    filename = file.filename
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed extensions: {', '.join(ALLOWED_EXTENSIONS)}"
        )
        
    # Save the uploaded file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    # Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(filename)

    # Double check extension after sanitization just in case
    if os.path.splitext(safe_filename)[1].lower() not in ALLOWED_EXTENSIONS:
         raise HTTPException(status_code=400, detail="Invalid file type")

    temp_file_path = os.path.join(temp_dir, safe_filename)
    
    try:
        # 2. Validate File Size & Write Securely
        size = 0
        with open(temp_file_path, "wb") as buffer:
            while chunk := await file.read(1024 * 1024): # Read in 1MB chunks
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE / (1024*1024)}MB"
                    )
                buffer.write(chunk)

        # Parse the document into LangChain elements
        docs = await parse_document(temp_file_path, project_id)
        
        # Chunking and embedding to Pinecone
        num_chunks = process_and_store_documents(docs, project_id)
        
        return {"status": "success", "message": f"Successfully parsed and embedded {num_chunks} chunks for {project_id}", "filename": file.filename}

    except HTTPException:
        raise # Re-raise HTTP exceptions (like 413 or 400)
    except Exception as e:
        logger.error("Error processing document upload for project %s: %s", project_id, str(e), exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")
    finally:
        # Clean up temp file
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception as cleanup_error:
                logger.warning(f"Failed to remove temp file {temp_file_path}: {cleanup_error}")
