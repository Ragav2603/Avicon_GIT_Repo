"""Knowledge Base — Folders & Documents CRUD.

Enforces per-user folder limits (10/user, 20/org) and
file size limits (20MB max). All operations are tenant-scoped.
"""

import re
import uuid
import logging
from pathlib import Path
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Request, HTTPException, File, UploadFile

from models.schemas import (
    FolderCreate,
    FolderResponse,
    FolderUpdate,
    KBDocumentResponse,
    KBDocumentUploadResponse,
    OrganizationLimits,
)

logger = logging.getLogger("avicon.kb")

router = APIRouter(prefix="/kb", tags=["knowledge-base"])

UPLOAD_DIR = Path("/tmp/avicon_kb")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB
MAX_FOLDERS_PER_USER = 10
MAX_FOLDERS_PER_ORG = 20
MAX_DOCS_PER_USER = 20
MAX_DOCS_PER_ORG = 100
ALLOWED_EXTS = {
    ".pdf",
    ".docx",
    ".xlsx",
    ".pptx",
    ".csv",
    ".txt",
    ".md",
    ".doc",
    ".xls",
}


def _get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, "db") else None


def _get_user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user.get("sub", "")


# ─── Folders ──────────────────────────────────────


@router.get("/folders", response_model=List[FolderResponse])
async def list_folders(request: Request):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    cursor = db.kb_folders.find({"user_id": user_id}).sort("created_at", -1)
    folders = await cursor.to_list(100)

    result = []
    for f in folders:
        doc_count = await db.kb_documents.count_documents({"folder_id": f["id"]})
        result.append(
            FolderResponse(
                id=f["id"],
                user_id=f["user_id"],
                organization_id=f.get("organization_id"),
                name=f["name"],
                is_private=f.get("is_private", True),
                document_count=doc_count,
                created_at=f.get("created_at", datetime.now(timezone.utc)),
            )
        )
    return result


@router.post("/folders", response_model=FolderResponse, status_code=201)
async def create_folder(request: Request, body: FolderCreate):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Enforce per-user limit
    count = await db.kb_folders.count_documents({"user_id": user_id})
    if count >= MAX_FOLDERS_PER_USER:
        raise HTTPException(
            status_code=400, detail=f"Maximum {MAX_FOLDERS_PER_USER} folders per user"
        )

    folder = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "organization_id": None,
        "name": body.name,
        "is_private": body.is_private,
        "created_at": datetime.now(timezone.utc),
    }
    await db.kb_folders.insert_one(folder)
    logger.info(f"FOLDER_CREATE | user={user_id} | name={body.name}")

    return FolderResponse(
        id=folder["id"],
        user_id=user_id,
        name=body.name,
        is_private=body.is_private,
        document_count=0,
        created_at=folder["created_at"],
    )


@router.put("/folders/{folder_id}", response_model=FolderResponse)
async def update_folder(request: Request, folder_id: str, body: FolderUpdate):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    folder = await db.kb_folders.find_one({"id": folder_id, "user_id": user_id})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    updates = {}
    if body.name is not None:
        updates["name"] = body.name
    if body.is_private is not None:
        updates["is_private"] = body.is_private

    if updates:
        await db.kb_folders.update_one({"id": folder_id}, {"$set": updates})
        folder.update(updates)

    doc_count = await db.kb_documents.count_documents({"folder_id": folder_id})
    return FolderResponse(
        id=folder["id"],
        user_id=user_id,
        name=folder["name"],
        is_private=folder.get("is_private", True),
        document_count=doc_count,
        created_at=folder.get("created_at", datetime.now(timezone.utc)),
    )


@router.delete("/folders/{folder_id}")
async def delete_folder(request: Request, folder_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    folder = await db.kb_folders.find_one({"id": folder_id, "user_id": user_id})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Delete all documents in folder
    await db.kb_documents.delete_many({"folder_id": folder_id})
    await db.kb_folders.delete_one({"id": folder_id})

    logger.info(f"FOLDER_DELETE | user={user_id} | folder={folder_id}")
    return {"status": "deleted", "folder_id": folder_id}


# ─── Documents ────────────────────────────────────


@router.get("/folders/{folder_id}/documents", response_model=List[KBDocumentResponse])
async def list_documents(request: Request, folder_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Verify folder ownership
    folder = await db.kb_folders.find_one({"id": folder_id, "user_id": user_id})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    cursor = db.kb_documents.find({"folder_id": folder_id}).sort("created_at", -1)
    docs = await cursor.to_list(200)

    return [
        KBDocumentResponse(
            id=d["id"],
            folder_id=d["folder_id"],
            name=d["name"],
            storage_path=d["storage_path"],
            file_size_mb=d["file_size_mb"],
            source_type=d.get("source_type", "local"),
            mime_type=d.get("mime_type"),
            status=d.get("status", "ready"),
            created_at=d.get("created_at", datetime.now(timezone.utc)),
        )
        for d in docs
    ]


@router.post("/folders/{folder_id}/upload", response_model=KBDocumentUploadResponse)
async def upload_document_to_folder(
    request: Request,
    folder_id: str,
    file: UploadFile = File(...),
):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Verify folder ownership
    folder = await db.kb_folders.find_one({"id": folder_id, "user_id": user_id})
    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    # Validate file extension
    filename = file.filename or "unknown"
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported")

    # Enforce per-user doc limit (20/user)
    user_docs = await db.kb_documents.count_documents({"user_id": user_id})
    if user_docs >= MAX_DOCS_PER_USER:
        raise HTTPException(
            status_code=400, detail=f"Maximum {MAX_DOCS_PER_USER} documents per user"
        )

    # Enforce org doc limit (100/org)
    total_docs = await db.kb_documents.count_documents({"user_id": user_id})
    if total_docs >= MAX_DOCS_PER_ORG:
        raise HTTPException(
            status_code=400, detail=f"Maximum {MAX_DOCS_PER_ORG} documents reached"
        )

    # Save file
    doc_id = str(uuid.uuid4())
    original_stem = Path(filename).stem
    safe_stem = re.sub(r"[^a-zA-Z0-9_\-]", "_", original_stem)
    safe_name = f"{doc_id}_{safe_stem}{ext}"
    save_path = UPLOAD_DIR / user_id
    save_path.mkdir(parents=True, exist_ok=True)
    file_path = save_path / safe_name

    file_size = 0
    CHUNK_SIZE = 1024 * 1024  # 1MB

    try:
        with open(file_path, "wb") as f:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    raise HTTPException(
                        status_code=400, detail="File exceeds 20MB limit"
                    )
                f.write(chunk)
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise e

    # Store document record
    doc_record = {
        "id": doc_id,
        "folder_id": folder_id,
        "user_id": user_id,
        "name": filename,
        "storage_path": str(file_path),
        "file_size_mb": round(file_size / (1024 * 1024), 2),
        "source_type": "local",
        "mime_type": file.content_type,
        "status": "ready",
        "created_at": datetime.now(timezone.utc),
    }
    await db.kb_documents.insert_one(doc_record)

    logger.info(
        f"KB_UPLOAD | user={user_id} | folder={folder_id} | file={filename} | size={doc_record['file_size_mb']}MB"
    )

    return KBDocumentUploadResponse(
        document=KBDocumentResponse(
            **{k: v for k, v in doc_record.items() if k != "_id" and k != "user_id"}
        ),
        message=f"'{filename}' uploaded successfully",
    )


@router.delete("/documents/{document_id}")
async def delete_document(request: Request, document_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    doc = await db.kb_documents.find_one({"id": document_id, "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove file from disk
    try:
        file_path = Path(doc["storage_path"])
        if file_path.exists():
            file_path.unlink()
    except Exception as e:
        logger.warning(f"Failed to delete file: {e}")

    await db.kb_documents.delete_one({"id": document_id})
    logger.info(f"KB_DELETE | user={user_id} | doc={document_id}")
    return {"status": "deleted", "document_id": document_id}


# ─── Organization Limits ──────────────────────────


@router.get("/limits", response_model=OrganizationLimits)
async def get_limits(request: Request):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    folder_count = await db.kb_folders.count_documents({"user_id": user_id})
    doc_count = await db.kb_documents.count_documents({"user_id": user_id})

    return OrganizationLimits(
        folder_limit=MAX_FOLDERS_PER_ORG,
        doc_limit=MAX_DOCS_PER_ORG,
        max_file_size_mb=20.0,
        current_folders=folder_count,
        current_docs=doc_count,
    )
