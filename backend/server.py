"""Avicon Enterprise API — Production-grade FastAPI backend.

Architecture:
  Request → CORS → Rate Limiter → JWT Auth → Audit Logger → Router

Multi-tenancy enforced at every layer:
  - JWT middleware extracts customer_id from Supabase token
  - All RAG queries scoped to customer's Pinecone namespace
  - Audit log captures every sensitive operation
"""
import logging
import os
from pathlib import Path
from typing import List

from dotenv import load_dotenv

# Load environment BEFORE any module that reads env vars at import time
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import APIRouter, FastAPI
from motor.motor_asyncio import AsyncIOMotorClient
from starlette.middleware.cors import CORSMiddleware

from middleware.audit import AuditLoggingMiddleware
from middleware.auth import JWTAuthMiddleware
from middleware.rate_limiter import RateLimiterMiddleware
from middleware.request_validator import RequestValidationMiddleware
from models.schemas import StatusCheck, StatusCheckCreate
from routers.documents import router as documents_router
from routers.health import router as health_router
from routers.query import router as query_router

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-20s | %(levelname)-7s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("avicon")

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'avicon_enterprise')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create the FastAPI app
app = FastAPI(
    title="Avicon Enterprise API",
    description="RAG-powered multi-tenant procurement intelligence platform",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# ─────────────────────────────────────────
# Middleware Stack (order matters: bottom → top)
# ─────────────────────────────────────────

# 1. CORS — must be first
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
)

# 2. Rate Limiter
app.add_middleware(
    RateLimiterMiddleware,
    requests_per_minute=30,
    requests_per_hour=500,
    burst_limit=10,
)

# 3. Request Validation
app.add_middleware(RequestValidationMiddleware)

# 4. JWT Authentication
app.add_middleware(JWTAuthMiddleware)

# 5. Audit Logging
app.add_middleware(AuditLoggingMiddleware, db=db)

# ─────────────────────────────────────────
# API Router with /api prefix
# ─────────────────────────────────────────
api_router = APIRouter(prefix="/api")

# Import and include routers
from routers.knowledge_base import router as kb_router
from routers.rfp_response import router as rfp_response_router
from routers.stats import router as stats_router
from routers.drafts import router as drafts_router
from routers.integrations import router as integrations_router
from routers.team_templates import router as team_templates_router
from routers.adoption_metrics import router as adoption_router

api_router.include_router(health_router)
api_router.include_router(query_router)
api_router.include_router(documents_router)
api_router.include_router(kb_router)
api_router.include_router(rfp_response_router)
api_router.include_router(stats_router)
api_router.include_router(drafts_router)
api_router.include_router(integrations_router)
api_router.include_router(team_templates_router)
api_router.include_router(adoption_router)

# Legacy status endpoints (kept for backward compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    await db.status_checks.insert_one(status_obj.model_dump())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**sc) for sc in status_checks]

# Include router
app.include_router(api_router)

# ─────────────────────────────────────────
# Lifecycle Events
# ─────────────────────────────────────────
@app.on_event("startup")
async def startup():
    # Expose db on app state for routers
    app.state.db = db
    logger.info("Avicon Enterprise API starting up...")
    logger.info(f"MongoDB: connected to {db_name}")
    logger.info(f"Pinecone Index: {os.environ.get('PINECONE_INDEX_NAME', 'not set')}")
    logger.info(f"Azure OpenAI: {os.environ.get('AZURE_OPENAI_ENDPOINT', 'not set')}")
    logger.info(f"Supabase: {os.environ.get('SUPABASE_URL', 'not set')}")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Avicon Enterprise API shutting down...")
    client.close()
