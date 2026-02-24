"""Health check and status endpoints."""
import logging
import os

from fastapi import APIRouter
from motor.motor_asyncio import AsyncIOMotorClient

from models.schemas import HealthResponse

logger = logging.getLogger("avicon.health")

router = APIRouter(tags=["health"])


@router.get("/", response_model=dict)
async def root():
    return {"message": "Avicon Enterprise API", "version": "1.0.0"}


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Comprehensive health check for all service dependencies."""
    services = {}

    # Check MongoDB
    try:
        mongo_url = os.environ.get("MONGO_URL", "")
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=3000)
        await client.admin.command("ping")
        services["mongodb"] = "healthy"
        client.close()
    except Exception:
        services["mongodb"] = "unhealthy"

    # Check Pinecone (basic connectivity)
    pinecone_key = os.environ.get("PINECONE_API_KEY", "")
    services["pinecone"] = "configured" if pinecone_key else "not_configured"

    # Check Azure OpenAI
    azure_key = os.environ.get("AZURE_OPENAI_API_KEY", "")
    services["azure_openai"] = "configured" if azure_key else "not_configured"

    # Check Supabase
    supabase_url = os.environ.get("SUPABASE_URL", "")
    services["supabase"] = "configured" if supabase_url else "not_configured"

    overall = "healthy" if all(v != "unhealthy" for v in services.values()) else "degraded"

    return HealthResponse(status=overall, services=services)
