"""Pydantic V2 models for the Avicon Enterprise API."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
import re


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────
class TokenPayload(BaseModel):
    sub: str
    email: Optional[str] = None
    role: Optional[str] = None
    aud: Optional[str] = None
    exp: Optional[int] = None


class AuthenticatedUser(BaseModel):
    id: str
    email: Optional[str] = None
    role: Optional[str] = None


# ──────────────────────────────────────────────
# RAG Query
# ──────────────────────────────────────────────
class QueryRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000, description="The natural-language question")
    namespace_override: Optional[str] = Field(None, description="Admin-only namespace override")

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        return v.strip()


class QueryResponse(BaseModel):
    status: str = "success"
    customer_id: str
    query: str
    response: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    latency_ms: Optional[float] = None
    cached: bool = False


# ──────────────────────────────────────────────
# Document Upload
# ──────────────────────────────────────────────
class UploadResponse(BaseModel):
    status: str = "success"
    filename: str
    customer_id: str
    chunks_created: int
    message: str


# ──────────────────────────────────────────────
# Audit Log
# ──────────────────────────────────────────────
class AuditLogEntry(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    action: str  # e.g. "rag_query", "document_upload", "pii_redacted"
    resource: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


# ──────────────────────────────────────────────
# Health / Status
# ──────────────────────────────────────────────
class HealthResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    services: Dict[str, str] = Field(default_factory=dict)


class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class StatusCheckCreate(BaseModel):
    client_name: str
