"""Supabase JWT verification middleware for server-to-server auth.

Every request to protected endpoints must carry a valid Supabase JWT.
The middleware extracts user identity and injects it into request.state.
"""

import logging
import os
from typing import Optional

import httpx
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

logger = logging.getLogger("avicon.auth")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

_http_client: Optional[httpx.AsyncClient] = None


def get_http_client() -> httpx.AsyncClient:
    global _http_client
    if _http_client is None:
        _http_client = httpx.AsyncClient(
            limits=httpx.Limits(max_keepalive_connections=50, max_connections=100),
            timeout=10.0,
        )
    return _http_client


async def verify_supabase_token(token: str) -> Optional[dict]:
    """Verify JWT by calling Supabase auth.getUser() server-side.

    This is the most secure approach — it validates the token against
    Supabase's auth server directly, ensuring revoked tokens are rejected.
    """
    try:
        client = get_http_client()
        response = await client.get(
            f"{SUPABASE_URL}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": SUPABASE_ANON_KEY,
            },
        )
        if response.status_code == 200:
            user_data = response.json()
            return {
                "sub": user_data.get("id"),
                "email": user_data.get("email"),
                "role": user_data.get("role"),
                "app_metadata": user_data.get("app_metadata", {}),
                "user_metadata": user_data.get("user_metadata", {}),
            }
        else:
            logger.warning(f"Supabase auth verification failed: {response.status_code}")
            return None
    except Exception as e:
        logger.error(f"Supabase auth verification error: {e}")
        return None


class JWTAuthMiddleware(BaseHTTPMiddleware):
    """Middleware that verifies Supabase JWTs on protected routes."""

    # Routes that don't require authentication
    PUBLIC_PATHS = {
        "/api/",
        "/api/health",
        "/api/health/",
        "/api/docs",
        "/api/docs/",
        "/api/redoc",
        "/api/redoc/",
        "/api/openapi.json",
        "/docs",
        "/redoc",
        "/openapi.json",
    }

    PUBLIC_PREFIXES = (
        "/api/status",
        "/api/rfp-response/templates",
        "/api/adoption",  # Adoption metrics endpoints - public for demo
    )

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Allow public paths
        if path in self.PUBLIC_PATHS or path.startswith(self.PUBLIC_PREFIXES):
            request.state.user = None
            return await call_next(request)

        # Allow OPTIONS (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Extract Bearer token
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header"},
            )

        token = auth_header.split("Bearer ")[1]

        # Verify with Supabase
        user = await verify_supabase_token(token)
        if not user:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid or expired token"},
            )

        # Inject authenticated user into request state
        request.state.user = user
        request.state.customer_id = user["sub"]  # This is the tenant isolation key

        logger.info(f"Authenticated user {user['sub']} for {request.method} {path}")
        return await call_next(request)
