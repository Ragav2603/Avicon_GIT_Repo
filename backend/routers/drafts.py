"""Collaborative RFP Drafts — CRUD + presence + versioning.

Lightweight collaboration via polling:
  - Auto-save on edit (PUT with debounce from frontend)
  - Presence heartbeat every 10s from frontend
  - Version history for undo/tracking
"""
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional

from fastapi import APIRouter, Request, HTTPException

from models.schemas import (
    DraftCreate, DraftUpdate, DraftResponse,
    DraftPresenceUpdate, DraftPresenceResponse, DraftVersionResponse,
)

logger = logging.getLogger("avicon.drafts")
router = APIRouter(prefix="/drafts", tags=["drafts"])

PRESENCE_TTL_SECONDS = 30  # editors expire after 30s without heartbeat


def _get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, 'db') else None


def _get_user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user.get("sub", "")


def _get_user_email(request: Request) -> str:
    user = getattr(request.state, "user", None)
    return user.get("email", "") if user else ""


def _draft_to_response(draft: dict) -> DraftResponse:
    """Convert MongoDB draft document to DraftResponse, filtering expired editors."""
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=PRESENCE_TTL_SECONDS)
    active = [
        e for e in draft.get("editors", [])
        if e.get("last_seen") and e["last_seen"] > cutoff
    ]
    return DraftResponse(
        id=draft["id"],
        user_id=draft["user_id"],
        title=draft["title"],
        content=draft.get("content", ""),
        template_id=draft.get("template_id"),
        document_ids=draft.get("document_ids", []),
        version=draft.get("version", 1),
        last_saved_at=draft.get("last_saved_at", draft.get("created_at")),
        created_at=draft.get("created_at"),
        active_editors=active,
    )


# ─── CRUD ─────────────────────────────────────

@router.get("", response_model=List[DraftResponse])
async def list_drafts(request: Request):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    cursor = db.rfp_drafts.find({"user_id": user_id}, {"_id": 0}).sort("last_saved_at", -1)
    drafts = await cursor.to_list(50)
    return [_draft_to_response(d) for d in drafts]


@router.post("", response_model=DraftResponse, status_code=201)
async def create_draft(request: Request, body: DraftCreate):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    now = datetime.now(timezone.utc)
    draft = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": body.title,
        "content": body.content,
        "template_id": body.template_id,
        "document_ids": body.document_ids,
        "version": 1,
        "editors": [],
        "versions": [{"version": 1, "content": body.content, "saved_by": user_id, "saved_at": now}],
        "last_saved_at": now,
        "created_at": now,
    }
    await db.rfp_drafts.insert_one(draft)
    logger.info(f"DRAFT_CREATE | user={user_id} | id={draft['id']} | title={body.title}")
    return _draft_to_response(draft)


@router.get("/{draft_id}", response_model=DraftResponse)
async def get_draft(request: Request, draft_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    draft = await db.rfp_drafts.find_one({"id": draft_id, "user_id": user_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")
    return _draft_to_response(draft)


@router.put("/{draft_id}", response_model=DraftResponse)
async def update_draft(request: Request, draft_id: str, body: DraftUpdate):
    """Auto-save endpoint — updates draft content/title and bumps version."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    draft = await db.rfp_drafts.find_one({"id": draft_id, "user_id": user_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    now = datetime.now(timezone.utc)
    updates = {"last_saved_at": now}
    if body.title is not None:
        updates["title"] = body.title
    if body.content is not None:
        updates["content"] = body.content
        new_version = draft.get("version", 1) + 1
        updates["version"] = new_version
        # Append to version history (keep last 20)
        version_entry = {"version": new_version, "content": body.content[:2000], "saved_by": user_id, "saved_at": now}
        await db.rfp_drafts.update_one(
            {"id": draft_id},
            {"$push": {"versions": {"$each": [version_entry], "$slice": -20}}},
        )

    await db.rfp_drafts.update_one({"id": draft_id}, {"$set": updates})
    updated = await db.rfp_drafts.find_one({"id": draft_id}, {"_id": 0})
    logger.info(f"DRAFT_SAVE | user={user_id} | id={draft_id} | v={updated.get('version')}")
    return _draft_to_response(updated)


@router.delete("/{draft_id}")
async def delete_draft(request: Request, draft_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    result = await db.rfp_drafts.delete_one({"id": draft_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Draft not found")
    logger.info(f"DRAFT_DELETE | user={user_id} | id={draft_id}")
    return {"status": "deleted", "draft_id": draft_id}


# ─── Presence ─────────────────────────────────

@router.post("/{draft_id}/presence", response_model=DraftPresenceResponse)
async def update_presence(request: Request, draft_id: str, body: DraftPresenceUpdate):
    """Heartbeat endpoint — called every 10s by the frontend to register presence."""
    user_id = _get_user_id(request)
    email = _get_user_email(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    draft = await db.rfp_drafts.find_one({"id": draft_id, "user_id": user_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    now = datetime.now(timezone.utc)
    editor_entry = {
        "user_id": user_id,
        "email": email,
        "name": body.user_name or email or "Unknown",
        "action": body.action,
        "last_seen": now,
    }

    # Upsert this editor in the editors array
    await db.rfp_drafts.update_one(
        {"id": draft_id, "editors.user_id": user_id},
        {"$set": {"editors.$": editor_entry}},
    )
    # If user wasn't in array, push them
    result = await db.rfp_drafts.update_one(
        {"id": draft_id, "editors.user_id": {"$ne": user_id}},
        {"$push": {"editors": editor_entry}},
    )

    # Return current active editors (filter expired)
    updated = await db.rfp_drafts.find_one({"id": draft_id}, {"_id": 0})
    cutoff = now - timedelta(seconds=PRESENCE_TTL_SECONDS)
    active = [e for e in updated.get("editors", []) if e.get("last_seen") and e["last_seen"] > cutoff]

    return DraftPresenceResponse(draft_id=draft_id, editors=active)


@router.get("/{draft_id}/presence", response_model=DraftPresenceResponse)
async def get_presence(request: Request, draft_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    draft = await db.rfp_drafts.find_one({"id": draft_id, "user_id": user_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    cutoff = datetime.now(timezone.utc) - timedelta(seconds=PRESENCE_TTL_SECONDS)
    active = [e for e in draft.get("editors", []) if e.get("last_seen") and e["last_seen"] > cutoff]

    return DraftPresenceResponse(draft_id=draft_id, editors=active)


# ─── Version History ──────────────────────────

@router.get("/{draft_id}/versions", response_model=List[DraftVersionResponse])
async def list_versions(request: Request, draft_id: str):
    user_id = _get_user_id(request)
    db = _get_db(request)
    if not db:
        raise HTTPException(status_code=503, detail="Database unavailable")

    draft = await db.rfp_drafts.find_one({"id": draft_id, "user_id": user_id}, {"_id": 0})
    if not draft:
        raise HTTPException(status_code=404, detail="Draft not found")

    versions = draft.get("versions", [])
    return [
        DraftVersionResponse(
            version=v["version"],
            content=v["content"],
            saved_by=v["saved_by"],
            saved_at=v["saved_at"],
        )
        for v in reversed(versions[-20:])
    ]
