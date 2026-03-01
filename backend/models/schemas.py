"""Pydantic V2 models for the Avicon Enterprise API."""

import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator


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
    query: str = Field(
        ..., min_length=1, max_length=2000, description="The natural-language question"
    )
    namespace_override: Optional[str] = Field(
        None, description="Admin-only namespace override"
    )

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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
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
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ──────────────────────────────────────────────
# Knowledge Base — Folders
# ──────────────────────────────────────────────
class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    is_private: bool = True

    @field_validator("name")
    @classmethod
    def sanitize_name(cls, v: str) -> str:
        return v.strip()


class FolderResponse(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str] = None
    name: str
    is_private: bool = True
    document_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FolderUpdate(BaseModel):
    name: Optional[str] = None
    is_private: Optional[bool] = None


# ──────────────────────────────────────────────
# Knowledge Base — Documents
# ──────────────────────────────────────────────
class KBDocumentResponse(BaseModel):
    id: str
    folder_id: str
    name: str
    storage_path: str
    file_size_mb: float
    source_type: str = "local"  # local | sharepoint | onedrive | gdocs
    mime_type: Optional[str] = None
    status: str = "ready"  # uploading | processing | ready | error
    created_at: datetime = Field(default_factory=datetime.utcnow)


class KBDocumentUploadResponse(BaseModel):
    status: str = "success"
    document: KBDocumentResponse
    message: str


# ──────────────────────────────────────────────
# Knowledge Base — Organization Limits
# ──────────────────────────────────────────────
class OrganizationLimits(BaseModel):
    folder_limit: int = 20
    doc_limit: int = 100
    max_file_size_mb: float = 20.0
    current_folders: int = 0
    current_docs: int = 0


# ──────────────────────────────────────────────
# Contextual AI Chat
# ──────────────────────────────────────────────
class ContextualChatRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=2000)
    document_ids: List[str] = Field(
        default_factory=list, description="KB document IDs to use as context"
    )
    session_id: Optional[str] = None

    @field_validator("query")
    @classmethod
    def sanitize_query(cls, v: str) -> str:
        return v.strip()


class ContextualChatResponse(BaseModel):
    status: str = "success"
    response: str
    session_id: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    latency_ms: Optional[float] = None


# ──────────────────────────────────────────────
# RFP Response Wizard
# ──────────────────────────────────────────────
class RFPDraftRequest(BaseModel):
    rfp_context: str = Field(
        ..., min_length=1, max_length=10000, description="The RFP question/section"
    )
    document_ids: List[str] = Field(
        default_factory=list, description="KB documents for context"
    )
    template_id: Optional[str] = None

    @field_validator("rfp_context")
    @classmethod
    def sanitize(cls, v: str) -> str:
        return v.strip()


class RFPDraftResponse(BaseModel):
    status: str = "success"
    draft: str
    template_used: Optional[str] = None
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    latency_ms: Optional[float] = None


class RFPTemplate(BaseModel):
    id: str
    name: str
    category: str  # e.g. "IFE", "MRO", "Catering", "Ground Handling"
    description: str
    prompt_template: str


# ──────────────────────────────────────────────
# Platform Stats
# ──────────────────────────────────────────────
class PlatformStats(BaseModel):
    total_documents: int = 0
    total_folders: int = 0
    queries_today: int = 0
    avg_response_ms: float = 0.0
    active_drafts: int = 0


# ──────────────────────────────────────────────
# Collaborative Drafts
# ──────────────────────────────────────────────
class DraftCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = ""
    template_id: Optional[str] = None
    document_ids: List[str] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        return v.strip()


class DraftUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class DraftResponse(BaseModel):
    id: str
    user_id: str
    title: str
    content: str
    template_id: Optional[str] = None
    document_ids: List[str] = Field(default_factory=list)
    version: int = 1
    last_saved_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    active_editors: List[Dict[str, Any]] = Field(default_factory=list)


class DraftPresenceUpdate(BaseModel):
    user_name: str = ""
    action: str = "viewing"  # viewing | editing


class DraftPresenceResponse(BaseModel):
    draft_id: str
    editors: List[Dict[str, Any]] = Field(default_factory=list)


class DraftVersionResponse(BaseModel):
    version: int
    content: str
    saved_by: str
    saved_at: datetime


# ──────────────────────────────────────────────
# External Integrations
# ──────────────────────────────────────────────
class IntegrationStatus(BaseModel):
    id: str
    provider: str  # sharepoint | onedrive | gdocs
    name: str
    status: str = "disconnected"  # disconnected | connecting | connected | error
    connected_at: Optional[datetime] = None
    account_email: Optional[str] = None


class IntegrationConnectRequest(BaseModel):
    provider: str
    auth_code: Optional[str] = None  # OAuth authorization code


class IntegrationFileItem(BaseModel):
    id: str
    name: str
    size_mb: float
    mime_type: str
    last_modified: Optional[str] = None
    provider: str


# ──────────────────────────────────────────────
# Team Templates (Shared RFP Response Templates)
# ──────────────────────────────────────────────
class TeamTemplateCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=500)
    content: str = Field(..., min_length=1)
    category: str = Field(default="General", max_length=50)
    tags: List[str] = Field(default_factory=list)
    is_shared: bool = True  # True = shared with org, False = personal

    @field_validator("title")
    @classmethod
    def sanitize_title(cls, v: str) -> str:
        return v.strip()

    @field_validator("tags")
    @classmethod
    def sanitize_tags(cls, v: List[str]) -> List[str]:
        return [t.strip().lower() for t in v if t.strip()][:10]


class TeamTemplateUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    is_shared: Optional[bool] = None


class TeamTemplateResponse(BaseModel):
    id: str
    user_id: str
    org_id: str
    title: str
    description: str
    content: str
    category: str
    tags: List[str] = Field(default_factory=list)
    is_shared: bool = True
    author_name: str = ""
    author_email: str = ""
    usage_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
