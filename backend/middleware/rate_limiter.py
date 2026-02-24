"""In-memory sliding window rate limiter middleware.

For production, swap the in-memory store with Redis.
"""
import logging
import time
from collections import defaultdict
from typing import Dict, List

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("avicon.rate_limiter")


class RateLimiterMiddleware(BaseHTTPMiddleware):
    """Sliding-window rate limiter per user or IP."""

    def __init__(
        self,
        app,
        requests_per_minute: int = 30,
        requests_per_hour: int = 500,
        burst_limit: int = 10,  # max requests in 5-second window
    ):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_hour = requests_per_hour
        self.burst_limit = burst_limit
        self._store: Dict[str, List[float]] = defaultdict(list)

    def _get_client_key(self, request: Request) -> str:
        """Get rate limit key — prefer user_id over IP."""
        user = getattr(request.state, "user", None)
        if user and isinstance(user, dict):
            return f"user:{user.get('sub', 'unknown')}"
        # Fall back to IP
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return f"ip:{forwarded.split(',')[0].strip()}"
        return f"ip:{request.client.host if request.client else 'unknown'}"

    def _clean_old_entries(self, entries: List[float], window_seconds: float) -> List[float]:
        """Remove entries older than the window."""
        cutoff = time.time() - window_seconds
        return [t for t in entries if t > cutoff]

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health checks
        if request.url.path in ("/api/", "/api/health", "/api/health/"):
            return await call_next(request)

        client_key = self._get_client_key(request)
        now = time.time()

        # Get and clean timestamps
        self._store[client_key] = self._clean_old_entries(
            self._store[client_key], 3600  # Keep 1 hour window
        )
        timestamps = self._store[client_key]

        # Check burst limit (5-second window)
        recent_burst = [t for t in timestamps if t > now - 5]
        if len(recent_burst) >= self.burst_limit:
            logger.warning(f"Burst rate limit exceeded for {client_key}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please slow down."},
                headers={"Retry-After": "5"},
            )

        # Check per-minute limit
        recent_minute = [t for t in timestamps if t > now - 60]
        if len(recent_minute) >= self.requests_per_minute:
            logger.warning(f"Per-minute rate limit exceeded for {client_key}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Try again in a minute."},
                headers={"Retry-After": "60"},
            )

        # Check per-hour limit
        if len(timestamps) >= self.requests_per_hour:
            logger.warning(f"Per-hour rate limit exceeded for {client_key}")
            return JSONResponse(
                status_code=429,
                content={"detail": "Hourly rate limit exceeded."},
                headers={"Retry-After": "3600"},
            )

        # Record this request
        self._store[client_key].append(now)

        response = await call_next(request)

        # Add rate limit headers
        remaining = self.requests_per_minute - len(recent_minute) - 1
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(max(0, remaining))

        return response
