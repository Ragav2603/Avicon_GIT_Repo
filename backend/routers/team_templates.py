"""Team Templates — Shared reusable RFP response templates.

Allows users to:
  - Save successful drafts as reusable templates
  - Share templates with the organization
  - Use team templates to pre-fill new drafts
  - Track template usage across the org
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Request, HTTPException, Query

from models.schemas import (
    TeamTemplateCreate, TeamTemplateUpdate, TeamTemplateResponse,
    DraftResponse,
)

logger = logging.getLogger("avicon.team_templates")
router = APIRouter(prefix="/team-templates", tags=["team-templates"])


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


def _get_org_id(request: Request) -> str:
    """Extract org from JWT metadata or use user_id as default org."""
    user = getattr(request.state, "user", None)
    if user:
        metadata = user.get("user_metadata", {})
        return metadata.get("organization_id", user.get("sub", "personal"))
    return "personal"


def _template_to_response(tmpl: dict) -> TeamTemplateResponse:
    return TeamTemplateResponse(
        id=tmpl["id"],
        user_id=tmpl["user_id"],
        org_id=tmpl.get("org_id", ""),
        title=tmpl["title"],
        description=tmpl.get("description", ""),
        content=tmpl.get("content", ""),
        category=tmpl.get("category", "General"),
        tags=tmpl.get("tags", []),
        is_shared=tmpl.get("is_shared", True),
        author_name=tmpl.get("author_name", ""),
        author_email=tmpl.get("author_email", ""),
        usage_count=tmpl.get("usage_count", 0),
        created_at=tmpl.get("created_at"),
        updated_at=tmpl.get("updated_at", tmpl.get("created_at")),
    )


@router.get("", response_model=List[TeamTemplateResponse])
async def list_team_templates(
    request: Request,
    category: str = Query(default=None, description="Filter by category"),
    search: str = Query(default=None, description="Search by title or tags"),
):
    """List templates visible to the user: their own + shared org templates."""
    user_id = _get_user_id(request)
    org_id = _get_org_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # User sees: own templates + shared templates from their org
    query_filter = {
        "$or": [
            {"user_id": user_id},
            {"org_id": org_id, "is_shared": True},
        ]
    }
    if category:
        query_filter["category"] = category
    if search:
        query_filter["$or"] = [
            {"user_id": user_id, "title": {"$regex": search, "$options": "i"}},
            {"org_id": org_id, "is_shared": True, "title": {"$regex": search, "$options": "i"}},
            {"user_id": user_id, "tags": {"$in": [search.lower()]}},
            {"org_id": org_id, "is_shared": True, "tags": {"$in": [search.lower()]}},
        ]

    cursor = db.team_templates.find(query_filter, {"_id": 0}).sort("usage_count", -1)
    templates = await cursor.to_list(100)
    return [_template_to_response(t) for t in templates]


@router.post("", response_model=TeamTemplateResponse, status_code=201)
async def create_team_template(request: Request, body: TeamTemplateCreate):
    """Create a new team template from scratch or from a successful draft."""
    user_id = _get_user_id(request)
    email = _get_user_email(request)
    org_id = _get_org_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    now = datetime.now(timezone.utc)
    tmpl = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "org_id": org_id,
        "title": body.title,
        "description": body.description,
        "content": body.content,
        "category": body.category,
        "tags": body.tags,
        "is_shared": body.is_shared,
        "author_name": email.split("@")[0] if email else "Unknown",
        "author_email": email,
        "usage_count": 0,
        "created_at": now,
        "updated_at": now,
    }
    await db.team_templates.insert_one(tmpl)
    logger.info(f"TEMPLATE_CREATE | user={user_id} | org={org_id} | title={body.title} | shared={body.is_shared}")
    return _template_to_response(tmpl)


@router.get("/{template_id}", response_model=TeamTemplateResponse)
async def get_team_template(request: Request, template_id: str):
    user_id = _get_user_id(request)
    org_id = _get_org_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    tmpl = await db.team_templates.find_one(
        {"id": template_id, "$or": [{"user_id": user_id}, {"org_id": org_id, "is_shared": True}]},
        {"_id": 0},
    )
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    return _template_to_response(tmpl)


@router.put("/{template_id}", response_model=TeamTemplateResponse)
async def update_team_template(request: Request, template_id: str, body: TeamTemplateUpdate):
    """Update a template. Only the author can update."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    tmpl = await db.team_templates.find_one({"id": template_id, "user_id": user_id}, {"_id": 0})
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found or not authorized")

    updates = {"updated_at": datetime.now(timezone.utc)}
    if body.title is not None:
        updates["title"] = body.title
    if body.description is not None:
        updates["description"] = body.description
    if body.content is not None:
        updates["content"] = body.content
    if body.category is not None:
        updates["category"] = body.category
    if body.tags is not None:
        updates["tags"] = [t.strip().lower() for t in body.tags if t.strip()][:10]
    if body.is_shared is not None:
        updates["is_shared"] = body.is_shared

    await db.team_templates.update_one({"id": template_id}, {"$set": updates})
    updated = await db.team_templates.find_one({"id": template_id}, {"_id": 0})
    logger.info(f"TEMPLATE_UPDATE | user={user_id} | id={template_id}")
    return _template_to_response(updated)


@router.delete("/{template_id}")
async def delete_team_template(request: Request, template_id: str):
    """Delete a template. Only the author can delete."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    result = await db.team_templates.delete_one({"id": template_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Template not found or not authorized")
    logger.info(f"TEMPLATE_DELETE | user={user_id} | id={template_id}")
    return {"status": "deleted", "template_id": template_id}


@router.post("/{template_id}/use", response_model=DraftResponse)
async def use_template(request: Request, template_id: str):
    """Create a new draft pre-filled from a team template. Increments usage count."""
    user_id = _get_user_id(request)
    org_id = _get_org_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    tmpl = await db.team_templates.find_one(
        {"id": template_id, "$or": [{"user_id": user_id}, {"org_id": org_id, "is_shared": True}]},
        {"_id": 0},
    )
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")

    # Increment usage count
    await db.team_templates.update_one({"id": template_id}, {"$inc": {"usage_count": 1}})

    # Create a new draft from this template
    now = datetime.now(timezone.utc)
    draft = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "title": f"{tmpl['title']} — Draft",
        "content": tmpl["content"],
        "template_id": template_id,
        "document_ids": [],
        "version": 1,
        "editors": [],
        "versions": [{"version": 1, "content": tmpl["content"][:2000], "saved_by": user_id, "saved_at": now}],
        "last_saved_at": now,
        "created_at": now,
    }
    await db.rfp_drafts.insert_one(draft)
    logger.info(f"TEMPLATE_USE | user={user_id} | template={template_id} | draft={draft['id']}")

    return DraftResponse(
        id=draft["id"],
        user_id=user_id,
        title=draft["title"],
        content=draft["content"],
        template_id=template_id,
        version=1,
        last_saved_at=now,
        created_at=now,
        active_editors=[],
    )


@router.get("/categories/list", response_model=List[str])
async def list_categories(request: Request):
    """List all unique template categories for the user's org."""
    user_id = _get_user_id(request)
    org_id = _get_org_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    categories = await db.team_templates.distinct(
        "category",
        {"$or": [{"user_id": user_id}, {"org_id": org_id, "is_shared": True}]},
    )
    return sorted(categories)
