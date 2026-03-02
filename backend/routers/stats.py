"""Platform Stats — Aggregated metrics for the dashboard."""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Request, HTTPException
from models.schemas import PlatformStats

logger = logging.getLogger("avicon.stats")
router = APIRouter(prefix="/stats", tags=["stats"])


def _get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, 'db') else None


def _get_user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user.get("sub", "")


@router.get("", response_model=PlatformStats)
async def get_platform_stats(request: Request):
    """Aggregated stats for the authenticated user's platform dashboard."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    total_docs = await db.kb_documents.count_documents({"user_id": user_id})
    total_folders = await db.kb_folders.count_documents({"user_id": user_id})
    active_drafts = await db.rfp_drafts.count_documents({"user_id": user_id})

    # Count today's audit log queries
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    queries_today = await db.audit_logs.count_documents({
        "user_id": user_id,
        "timestamp": {"$gte": today_start},
    })

    # Average response time from recent audit logs
    pipeline = [
        {"$match": {"user_id": user_id, "metadata.latency_ms": {"$exists": True}}},
        {"$sort": {"timestamp": -1}},
        {"$limit": 50},
        {"$group": {"_id": None, "avg_ms": {"$avg": "$metadata.latency_ms"}}},
    ]
    cursor = db.audit_logs.aggregate(pipeline)
    agg_result = await cursor.to_list(1)
    avg_response = round(agg_result[0]["avg_ms"], 1) if agg_result else 0.0

    return PlatformStats(
        total_documents=total_docs,
        total_folders=total_folders,
        queries_today=queries_today,
        avg_response_ms=avg_response,
        active_drafts=active_drafts,
    )
