"""External Integrations — Connection stubs for SharePoint, OneDrive, Google Docs.

These endpoints provide the backend scaffolding for OAuth connection flows.
Actual OAuth implementation requires provider API keys from the user.
"""
import uuid
import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Request, HTTPException
from models.schemas import IntegrationStatus, IntegrationConnectRequest, IntegrationFileItem

logger = logging.getLogger("avicon.integrations")
router = APIRouter(prefix="/integrations", tags=["integrations"])

# Supported providers
PROVIDERS = {
    "sharepoint": {"name": "SharePoint", "oauth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"},
    "onedrive": {"name": "OneDrive", "oauth_url": "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"},
    "gdocs": {"name": "Google Docs", "oauth_url": "https://accounts.google.com/o/oauth2/v2/auth"},
}

# Mock files for preview when not connected
MOCK_FILES = {
    "sharepoint": [
        IntegrationFileItem(id="sp-1", name="RFP_Template_2025.docx", size_mb=2.4, mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", last_modified="2025-12-15", provider="sharepoint"),
        IntegrationFileItem(id="sp-2", name="Vendor_Compliance_Matrix.xlsx", size_mb=1.1, mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", last_modified="2025-12-10", provider="sharepoint"),
        IntegrationFileItem(id="sp-3", name="Technical_Specifications.pdf", size_mb=5.7, mime_type="application/pdf", last_modified="2025-11-28", provider="sharepoint"),
    ],
    "onedrive": [
        IntegrationFileItem(id="od-1", name="Fleet_Maintenance_Log.xlsx", size_mb=3.2, mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", last_modified="2025-12-14", provider="onedrive"),
        IntegrationFileItem(id="od-2", name="Procurement_Guidelines_v3.pdf", size_mb=1.8, mime_type="application/pdf", last_modified="2025-12-08", provider="onedrive"),
    ],
    "gdocs": [
        IntegrationFileItem(id="gd-1", name="IFE_Vendor_Evaluation.docx", size_mb=0.8, mime_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", last_modified="2025-12-12", provider="gdocs"),
        IntegrationFileItem(id="gd-2", name="Budget_Forecast_2026.xlsx", size_mb=2.1, mime_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", last_modified="2025-12-01", provider="gdocs"),
    ],
}


def _get_db(request: Request):
    return request.app.state.db if hasattr(request.app.state, 'db') else None


def _get_user_id(request: Request) -> str:
    user = getattr(request.state, "user", None)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user.get("sub", "")


@router.get("", response_model=List[IntegrationStatus])
async def list_integrations(request: Request):
    """List all available external integrations and their connection status."""
    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    results = []
    for provider_id, info in PROVIDERS.items():
        conn = await db.integrations.find_one(
            {"user_id": user_id, "provider": provider_id}, {"_id": 0}
        )
        results.append(IntegrationStatus(
            id=conn["id"] if conn else str(uuid.uuid4()),
            provider=provider_id,
            name=info["name"],
            status=conn.get("status", "disconnected") if conn else "disconnected",
            connected_at=conn.get("connected_at") if conn else None,
            account_email=conn.get("account_email") if conn else None,
        ))
    return results


@router.post("/{provider}/connect", response_model=IntegrationStatus)
async def connect_integration(request: Request, provider: str, body: IntegrationConnectRequest):
    """Initiate or complete OAuth connection for an external provider.

    STUB: Returns a simulated 'connected' status. Real OAuth requires provider API keys.
    """
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    now = datetime.now(timezone.utc)
    info = PROVIDERS[provider]

    # In a real implementation, we'd exchange auth_code for tokens here
    # For now, simulate a successful connection
    conn = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "provider": provider,
        "status": "connected",
        "connected_at": now,
        "account_email": f"user@{provider}.example.com",
    }

    await db.integrations.update_one(
        {"user_id": user_id, "provider": provider},
        {"$set": conn},
        upsert=True,
    )

    logger.info(f"INTEGRATION_CONNECT | user={user_id} | provider={provider}")

    return IntegrationStatus(
        id=conn["id"],
        provider=provider,
        name=info["name"],
        status="connected",
        connected_at=now,
        account_email=conn["account_email"],
    )


@router.delete("/{provider}/disconnect")
async def disconnect_integration(request: Request, provider: str):
    """Disconnect an external provider integration."""
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    await db.integrations.delete_one({"user_id": user_id, "provider": provider})
    logger.info(f"INTEGRATION_DISCONNECT | user={user_id} | provider={provider}")
    return {"status": "disconnected", "provider": provider}


@router.get("/{provider}/files", response_model=List[IntegrationFileItem])
async def list_provider_files(request: Request, provider: str):
    """List files available from a connected external provider.

    STUB: Returns mock files. Real implementation would call the provider's API.
    """
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    user_id = _get_user_id(request)
    db = _get_db(request)
    if db is None:
        raise HTTPException(status_code=503, detail="Database unavailable")

    # Check connection status
    conn = await db.integrations.find_one({"user_id": user_id, "provider": provider}, {"_id": 0})
    if not conn or conn.get("status") != "connected":
        raise HTTPException(status_code=400, detail=f"{PROVIDERS[provider]['name']} is not connected")

    return MOCK_FILES.get(provider, [])


@router.post("/{provider}/sync/{file_id}")
async def sync_file_to_kb(request: Request, provider: str, file_id: str, folder_id: str = ""):
    """Sync a file from an external provider into a KB folder.

    STUB: Returns a simulated success. Real implementation would download and store the file.
    """
    if provider not in PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")

    user_id = _get_user_id(request)
    db = _get_db(request)

    # Find the mock file
    files = MOCK_FILES.get(provider, [])
    target = next((f for f in files if f.id == file_id), None)
    if not target:
        raise HTTPException(status_code=404, detail="File not found in provider")

    logger.info(f"INTEGRATION_SYNC | user={user_id} | provider={provider} | file={target.name}")
    return {
        "status": "synced",
        "file_name": target.name,
        "provider": provider,
        "message": f"'{target.name}' synced to Knowledge Base (stub - actual download requires provider API keys)",
    }
