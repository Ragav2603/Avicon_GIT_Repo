"""Audit logging middleware — logs all AI extractions and sensitive data access.

Writes to both structured Python logging and MongoDB for compliance.
"""
import time
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("avicon.audit")

# Paths that trigger detailed audit logging
AUDITED_PATHS = (
    "/api/query",
    "/api/documents",
    "/api/upload",
)


class AuditLoggingMiddleware(BaseHTTPMiddleware):
    """Logs all requests to audited endpoints with user context."""

    def __init__(self, app, db=None):
        super().__init__(app)
        self.db = db  # MongoDB database instance

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        start_time = time.time()

        # Process the request
        response = await call_next(request)

        # Only audit sensitive paths
        if any(path.startswith(p) for p in AUDITED_PATHS):
            duration_ms = (time.time() - start_time) * 1000

            user = getattr(request.state, "user", None)
            user_id = user.get("sub", "anonymous") if isinstance(user, dict) else "anonymous"

            forwarded = request.headers.get("X-Forwarded-For", "")
            ip = forwarded.split(",")[0].strip() if forwarded else (
                request.client.host if request.client else "unknown"
            )

            audit_entry = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id,
                "action": f"{request.method} {path}",
                "method": request.method,
                "path": path,
                "status_code": response.status_code,
                "duration_ms": round(duration_ms, 2),
                "ip_address": ip,
                "user_agent": request.headers.get("User-Agent", "unknown"),
            }

            # Structured log output (stdout for container logging)
            logger.info(
                f"AUDIT | user={user_id} | action={request.method} {path} | "
                f"status={response.status_code} | duration={duration_ms:.1f}ms | ip={ip}"
            )

            # Persist to MongoDB asynchronously
            if self.db is not None:
                try:
                    await self.db.audit_logs.insert_one(audit_entry)
                except Exception as e:
                    logger.error(f"Failed to persist audit log: {e}")

        return response
