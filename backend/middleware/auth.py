"""Supabase JWT verification middleware for server-to-server auth.

Every request to protected endpoints must carry a valid Supabase JWT.
The middleware extracts user identity and injects it into request.state.
"""
import os
import logging
from typing import Optional

import httpx
from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt, JWTError

logger = logging.getLogger("avicon.auth")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
SUPABASE_ANON_KEY = os.environ.get("SUPABASE_ANON_KEY", "")

# JWT secret from Supabase (derived from service role key or set explicitly)
SUPABASE_JWT_SECRET = os.environ.get("SUPABASE_JWT_SECRET", "")

security = HTTPBearer(auto_error=False)


async def verify_supabase_token(token: str) -> Optional[dict]:
    """Verify JWT by calling Supabase auth.getUser() server-side.
    
    This is the most secure approach — it validates the token against
    Supabase's auth server directly, ensuring revoked tokens are rejected.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {token}",
                    "apikey": SUPABASE_ANON_KEY,
                },
                timeout=10.0,
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
        "/docs",
        "/redoc",
        "/openapi.json",
    }

    PUBLIC_PREFIXES = (
        "/api/status",
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
            raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

        token = auth_header.split("Bearer ")[1]

        # Verify with Supabase
        user = await verify_supabase_token(token)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired token")

        # Inject authenticated user into request state
        request.state.user = user
        request.state.customer_id = user["sub"]  # This is the tenant isolation key

        logger.info(f"Authenticated user {user['sub']} for {request.method} {path}")
        return await call_next(request)
