from fastapi import APIRouter, File, UploadFile, Form, HTTPException
import os
import shutil
from typing import List
from services.document_parser import parse_document
from services.rag_engine import process_and_store_documents

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("/")
async def upload_document(
    customer_id: str = Form(...),
    file: UploadFile = File(...)
):
    if not customer_id:
        raise HTTPException(status_code=400, detail="customer_id is required")
        
    # Save the uploaded file temporarily
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    # Sanitize filename to prevent path traversal
    safe_filename = os.path.basename(file.filename)
    temp_file_path = os.path.join(temp_dir, safe_filename)
    
    with open(temp_file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        # Parse the document into LangChain elements
        docs = await parse_document(temp_file_path, customer_id)
        
        # Chunking and embedding to Pinecone
        num_chunks = process_and_store_documents(docs, customer_id)
        
        return {"status": "success", "message": f"Successfully parsed and embedded {num_chunks} chunks for {customer_id}", "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)
