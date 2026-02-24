"""Request validation middleware.

Validates Content-Type, request body size, and sanitizes input
before it reaches route handlers.
"""
import logging

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("avicon.validation")

MAX_BODY_SIZE = 50 * 1024 * 1024  # 50MB max request body


class RequestValidationMiddleware(BaseHTTPMiddleware):
    """Validates incoming requests for security and correctness."""

    async def dispatch(self, request: Request, call_next):
        # Skip validation for GET, OPTIONS, HEAD
        if request.method in ("GET", "OPTIONS", "HEAD"):
            return await call_next(request)

        # Check Content-Length if present
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                size = int(content_length)
                if size > MAX_BODY_SIZE:
                    logger.warning(f"REQUEST_TOO_LARGE | size={size} | path={request.url.path}")
                    return JSONResponse(
                        status_code=413,
                        content={"detail": f"Request body too large. Maximum size is {MAX_BODY_SIZE // (1024*1024)}MB"},
                    )
            except ValueError:
                pass

        # Validate Content-Type for JSON endpoints
        path = request.url.path
        if path.startswith("/api/query"):
            content_type = request.headers.get("content-type", "")
            if "application/json" not in content_type:
                return JSONResponse(
                    status_code=415,
                    content={"detail": "Content-Type must be application/json"},
                )

        return await call_next(request)
