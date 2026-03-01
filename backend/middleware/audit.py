"""Audit logging middleware — logs all AI extractions and sensitive data access.

Writes to both structured Python logging and MongoDB for compliance.
"""
import logging
import time
import uuid
import os
import ipaddress
from datetime import datetime, timezone

from fastapi import BackgroundTasks, Request
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

        # Parse trusted proxies once on startup
        self.trusted_proxies_env = os.environ.get("TRUSTED_PROXIES", "127.0.0.1")
        self.trust_all_proxies = self.trusted_proxies_env == "*"

        self.trusted_networks = []
        if not self.trust_all_proxies:
            try:
                self.trusted_networks = [
                    ipaddress.ip_network(p.strip())
                    for p in self.trusted_proxies_env.split(",") if p.strip()
                ]
            except ValueError:
                self.trusted_networks = []

    def _is_trusted(self, ip_str: str) -> bool:
        if self.trust_all_proxies:
            return True
        try:
            ip_obj = ipaddress.ip_address(ip_str)
            return any(ip_obj in net for net in self.trusted_networks)
        except ValueError:
            return False

    def _get_client_ip(self, request: Request) -> str:
        """Securely extract client IP addressing X-Forwarded-For spoofing."""
        client_host = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("X-Forwarded-For", "")

        if not forwarded_for:
            return client_host

        if self.trust_all_proxies:
            return forwarded_for.split(",")[0].strip()

        if client_host != "unknown" and not self._is_trusted(client_host):
            return client_host

        ips = [ip.strip() for ip in forwarded_for.split(",")]
        for ip in reversed(ips):
            if not self._is_trusted(ip):
                return ip

        return ips[0] if ips else client_host

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

            ip = self._get_client_ip(request)

            audit_entry = {
                "id": str(uuid.uuid4()),
                "timestamp": datetime.now(timezone.utc).isoformat(),
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

            # Persist to MongoDB in the background
            if self.db is not None:
                if response.background is None:
                    response.background = BackgroundTasks()
                response.background.add_task(self._persist_audit_log, audit_entry)

        return response

    async def _persist_audit_log(self, audit_entry: dict):
        """Helper to persist audit log in the background."""
        try:
            await self.db.audit_logs.insert_one(audit_entry)
        except Exception as e:
            logger.error(f"Failed to persist audit log in background: {e}")
