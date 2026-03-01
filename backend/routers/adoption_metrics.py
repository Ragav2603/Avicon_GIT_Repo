"""
Adoption Metrics Router - Telemetry Integration & Usage Tracking
For approved/accepted RFPs and their proposals only.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime, timedelta
from enum import Enum
import uuid

router = APIRouter(prefix="/adoption", tags=["Adoption Metrics"])

# ──────────────────────────────────────────────
# Enums and Models
# ──────────────────────────────────────────────

class TelemetryProvider(str, Enum):
    ADOBE_ANALYTICS = "adobe_analytics"
    APP_DYNAMICS = "appdynamics"
    APP_INSIGHTS = "appinsights"
    MANUAL = "manual"


class TelemetryConnectionCreate(BaseModel):
    provider: TelemetryProvider
    name: str = Field(..., min_length=1, max_length=100)
    # Provider-specific credentials (stored encrypted in production)
    config: Dict[str, Any] = Field(default_factory=dict)
    # Link to accepted submission
    submission_id: str
    rfp_id: str


class TelemetryConnectionResponse(BaseModel):
    id: str
    provider: TelemetryProvider
    name: str
    submission_id: str
    rfp_id: str
    status: str  # connected | error | pending
    last_sync: Optional[datetime] = None
    created_at: datetime


class MetricDataPoint(BaseModel):
    timestamp: datetime
    value: float
    dimension: Optional[str] = None  # e.g., "user_segment", "feature"


class AdoptionMetricCreate(BaseModel):
    connection_id: str
    metric_type: Literal["daily_active_users", "feature_usage", "session_duration", "page_views", "custom"]
    metric_name: str
    data_points: List[MetricDataPoint]


class AdoptionMetricResponse(BaseModel):
    id: str
    connection_id: str
    submission_id: str
    rfp_id: str
    metric_type: str
    metric_name: str
    current_value: float
    previous_value: Optional[float] = None
    change_percent: Optional[float] = None
    trend: Literal["up", "down", "stable"]
    data_points: List[Dict[str, Any]]
    last_updated: datetime


class ManualMetricEntry(BaseModel):
    submission_id: str
    rfp_id: str
    metric_name: str
    value: float
    period_start: datetime
    period_end: datetime
    notes: Optional[str] = None


class AdoptionSummary(BaseModel):
    submission_id: str
    rfp_id: str
    rfp_title: str
    vendor_name: str
    solution_name: str
    overall_adoption_score: float
    health_status: Literal["healthy", "warning", "critical"]
    metrics: List[AdoptionMetricResponse]
    recommendations: List[str]


# ──────────────────────────────────────────────
# In-Memory Storage (Replace with Supabase in production)
# ──────────────────────────────────────────────

telemetry_connections: Dict[str, Dict] = {}
adoption_metrics: Dict[str, Dict] = {}
manual_entries: Dict[str, Dict] = {}

# Mock accepted submissions (in production, fetch from Supabase)
MOCK_ACCEPTED_SUBMISSIONS = {
    "sub-001": {
        "id": "sub-001",
        "rfp_id": "rfp-001",
        "rfp_title": "In-Flight Entertainment System Upgrade",
        "vendor_id": "vendor-001",
        "vendor_name": "SkyTech Solutions",
        "solution_name": "SkyIFE Pro",
        "status": "accepted",
        "airline_id": "airline-001",
        "airline_name": "Global Airways"
    },
    "sub-002": {
        "id": "sub-002",
        "rfp_id": "rfp-002",
        "rfp_title": "Crew Scheduling Platform",
        "vendor_id": "vendor-002",
        "vendor_name": "FlightOps Inc",
        "solution_name": "CrewSync 360",
        "status": "accepted",
        "airline_id": "airline-001",
        "airline_name": "Global Airways"
    },
    "sub-003": {
        "id": "sub-003",
        "rfp_id": "rfp-003",
        "rfp_title": "MRO Management System",
        "vendor_id": "vendor-003",
        "vendor_name": "AeroMaint Pro",
        "solution_name": "MROTrack Enterprise",
        "status": "accepted",
        "airline_id": "airline-002",
        "airline_name": "Pacific Airlines"
    }
}


# ──────────────────────────────────────────────
# Helper Functions
# ──────────────────────────────────────────────

def calculate_adoption_score(metrics: List[Dict]) -> float:
    """Calculate overall adoption score from metrics."""
    if not metrics:
        return 0.0
    
    weights = {
        "daily_active_users": 0.3,
        "feature_usage": 0.25,
        "session_duration": 0.2,
        "page_views": 0.15,
        "custom": 0.1
    }
    
    total_score = 0.0
    total_weight = 0.0
    
    for metric in metrics:
        weight = weights.get(metric.get("metric_type", "custom"), 0.1)
        # Normalize value to 0-100 scale based on metric type
        value = metric.get("current_value", 0)
        normalized = min(100, max(0, value))  # Clamp to 0-100
        total_score += normalized * weight
        total_weight += weight
    
    return round(total_score / total_weight if total_weight > 0 else 0, 1)


def determine_health_status(score: float) -> str:
    """Determine health status based on adoption score."""
    if score >= 70:
        return "healthy"
    elif score >= 40:
        return "warning"
    return "critical"


def generate_recommendations(metrics: List[Dict], score: float) -> List[str]:
    """Generate AI-powered recommendations based on metrics."""
    recommendations = []
    
    if score < 40:
        recommendations.append("Critical: Schedule immediate training sessions to improve adoption.")
    
    for metric in metrics:
        if metric.get("trend") == "down":
            recommendations.append(f"⚠️ {metric['metric_name']} is declining. Consider user feedback sessions.")
        if metric.get("current_value", 0) < 30:
            recommendations.append(f"📉 {metric['metric_name']} is low. Review implementation and user documentation.")
    
    if score >= 70:
        recommendations.append("✅ Strong adoption. Consider expanding to additional user groups.")
    
    if not recommendations:
        recommendations.append("📊 Continue monitoring metrics for trends.")
    
    return recommendations[:5]  # Limit to 5 recommendations


# ──────────────────────────────────────────────
# Telemetry Connection Endpoints
# ──────────────────────────────────────────────

@router.get("/providers")
async def list_telemetry_providers():
    """List available telemetry providers and their configuration requirements."""
    return {
        "providers": [
            {
                "id": "adobe_analytics",
                "name": "Adobe Analytics",
                "icon": "adobe",
                "config_fields": [
                    {"key": "company_id", "label": "Company ID", "type": "text", "required": True},
                    {"key": "api_key", "label": "API Key", "type": "password", "required": True},
                    {"key": "report_suite_id", "label": "Report Suite ID", "type": "text", "required": True}
                ]
            },
            {
                "id": "appdynamics",
                "name": "AppDynamics",
                "icon": "appdynamics",
                "config_fields": [
                    {"key": "controller_url", "label": "Controller URL", "type": "url", "required": True},
                    {"key": "account_name", "label": "Account Name", "type": "text", "required": True},
                    {"key": "api_key", "label": "API Key", "type": "password", "required": True},
                    {"key": "application_name", "label": "Application Name", "type": "text", "required": True}
                ]
            },
            {
                "id": "appinsights",
                "name": "Azure App Insights",
                "icon": "azure",
                "config_fields": [
                    {"key": "instrumentation_key", "label": "Instrumentation Key", "type": "password", "required": True},
                    {"key": "app_id", "label": "Application ID", "type": "text", "required": True},
                    {"key": "api_key", "label": "API Key", "type": "password", "required": True}
                ]
            },
            {
                "id": "manual",
                "name": "Manual Entry",
                "icon": "edit",
                "config_fields": []
            }
        ]
    }


@router.post("/connections", response_model=TelemetryConnectionResponse)
async def create_telemetry_connection(connection: TelemetryConnectionCreate):
    """Create a new telemetry connection for an accepted submission."""
    # Verify submission is accepted
    submission = MOCK_ACCEPTED_SUBMISSIONS.get(connection.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found or not accepted")
    if submission.get("status") != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted submissions can have telemetry connections")
    
    connection_id = f"conn-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()
    
    conn_data = {
        "id": connection_id,
        "provider": connection.provider,
        "name": connection.name,
        "submission_id": connection.submission_id,
        "rfp_id": connection.rfp_id,
        "config": connection.config,  # In production, encrypt this
        "status": "pending" if connection.provider != TelemetryProvider.MANUAL else "connected",
        "last_sync": None,
        "created_at": now
    }
    
    telemetry_connections[connection_id] = conn_data
    
    return TelemetryConnectionResponse(
        id=connection_id,
        provider=connection.provider,
        name=connection.name,
        submission_id=connection.submission_id,
        rfp_id=connection.rfp_id,
        status=conn_data["status"],
        last_sync=conn_data["last_sync"],
        created_at=now
    )


@router.get("/connections")
async def list_telemetry_connections(
    submission_id: Optional[str] = None,
    rfp_id: Optional[str] = None
):
    """List telemetry connections, optionally filtered by submission or RFP."""
    connections = list(telemetry_connections.values())
    
    if submission_id:
        connections = [c for c in connections if c["submission_id"] == submission_id]
    if rfp_id:
        connections = [c for c in connections if c["rfp_id"] == rfp_id]
    
    return {"connections": connections}


@router.post("/connections/{connection_id}/sync")
async def sync_telemetry_data(connection_id: str, background_tasks: BackgroundTasks):
    """Trigger a sync of telemetry data from the provider."""
    conn = telemetry_connections.get(connection_id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    if conn["provider"] == TelemetryProvider.MANUAL:
        raise HTTPException(status_code=400, detail="Manual connections do not support sync")
    
    # In production, this would trigger actual API calls to the telemetry provider
    # For now, we simulate with mock data
    background_tasks.add_task(simulate_telemetry_sync, connection_id)
    
    return {"status": "sync_initiated", "connection_id": connection_id}


async def simulate_telemetry_sync(connection_id: str):
    """Simulate fetching data from a telemetry provider."""
    import random
    
    conn = telemetry_connections.get(connection_id)
    if not conn:
        return
    
    # Update connection status
    conn["status"] = "connected"
    conn["last_sync"] = datetime.utcnow()
    
    # Generate mock metrics
    metric_types = ["daily_active_users", "feature_usage", "session_duration", "page_views"]
    
    for metric_type in metric_types:
        metric_id = f"metric-{uuid.uuid4().hex[:8]}"
        base_value = random.uniform(30, 95)
        
        # Generate data points for last 30 days
        data_points = []
        for i in range(30):
            date = datetime.utcnow() - timedelta(days=29-i)
            value = base_value + random.uniform(-10, 10)
            data_points.append({
                "timestamp": date.isoformat(),
                "value": round(value, 1)
            })
        
        current_value = data_points[-1]["value"]
        previous_value = data_points[-7]["value"] if len(data_points) > 7 else None
        
        change_percent = None
        trend = "stable"
        if previous_value:
            change_percent = round(((current_value - previous_value) / previous_value) * 100, 1)
            if change_percent > 5:
                trend = "up"
            elif change_percent < -5:
                trend = "down"
        
        adoption_metrics[metric_id] = {
            "id": metric_id,
            "connection_id": connection_id,
            "submission_id": conn["submission_id"],
            "rfp_id": conn["rfp_id"],
            "metric_type": metric_type,
            "metric_name": metric_type.replace("_", " ").title(),
            "current_value": current_value,
            "previous_value": previous_value,
            "change_percent": change_percent,
            "trend": trend,
            "data_points": data_points,
            "last_updated": datetime.utcnow().isoformat()
        }


@router.delete("/connections/{connection_id}")
async def delete_telemetry_connection(connection_id: str):
    """Delete a telemetry connection."""
    if connection_id not in telemetry_connections:
        raise HTTPException(status_code=404, detail="Connection not found")
    
    del telemetry_connections[connection_id]
    
    # Also delete associated metrics
    metrics_to_delete = [k for k, v in adoption_metrics.items() if v["connection_id"] == connection_id]
    for metric_id in metrics_to_delete:
        del adoption_metrics[metric_id]
    
    return {"status": "deleted", "connection_id": connection_id}


# ──────────────────────────────────────────────
# Manual Entry Endpoints
# ──────────────────────────────────────────────

@router.post("/manual-entry")
async def create_manual_metric_entry(entry: ManualMetricEntry):
    """Create a manual metric entry for an accepted submission."""
    # Verify submission is accepted
    submission = MOCK_ACCEPTED_SUBMISSIONS.get(entry.submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found or not accepted")
    
    entry_id = f"manual-{uuid.uuid4().hex[:8]}"
    metric_id = f"metric-{uuid.uuid4().hex[:8]}"
    now = datetime.utcnow()
    
    manual_entries[entry_id] = {
        "id": entry_id,
        "submission_id": entry.submission_id,
        "rfp_id": entry.rfp_id,
        "metric_name": entry.metric_name,
        "value": entry.value,
        "period_start": entry.period_start.isoformat(),
        "period_end": entry.period_end.isoformat(),
        "notes": entry.notes,
        "created_at": now.isoformat()
    }
    
    # Create corresponding metric
    adoption_metrics[metric_id] = {
        "id": metric_id,
        "connection_id": None,
        "submission_id": entry.submission_id,
        "rfp_id": entry.rfp_id,
        "metric_type": "custom",
        "metric_name": entry.metric_name,
        "current_value": entry.value,
        "previous_value": None,
        "change_percent": None,
        "trend": "stable",
        "data_points": [{
            "timestamp": entry.period_end.isoformat(),
            "value": entry.value
        }],
        "last_updated": now.isoformat(),
        "source": "manual"
    }
    
    return {"status": "created", "entry_id": entry_id, "metric_id": metric_id}


@router.get("/manual-entries")
async def list_manual_entries(submission_id: Optional[str] = None):
    """List manual metric entries."""
    entries = list(manual_entries.values())
    
    if submission_id:
        entries = [e for e in entries if e["submission_id"] == submission_id]
    
    return {"entries": entries}


# ──────────────────────────────────────────────
# Metrics & Summary Endpoints
# ──────────────────────────────────────────────

@router.get("/metrics")
async def list_adoption_metrics(
    submission_id: Optional[str] = None,
    rfp_id: Optional[str] = None,
    metric_type: Optional[str] = None
):
    """List adoption metrics with optional filtering."""
    metrics = list(adoption_metrics.values())
    
    if submission_id:
        metrics = [m for m in metrics if m["submission_id"] == submission_id]
    if rfp_id:
        metrics = [m for m in metrics if m["rfp_id"] == rfp_id]
    if metric_type:
        metrics = [m for m in metrics if m["metric_type"] == metric_type]
    
    return {"metrics": metrics}


@router.get("/summary/{submission_id}", response_model=AdoptionSummary)
async def get_adoption_summary(submission_id: str):
    """Get comprehensive adoption summary for an accepted submission."""
    submission = MOCK_ACCEPTED_SUBMISSIONS.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    
    # Get all metrics for this submission
    metrics = [m for m in adoption_metrics.values() if m["submission_id"] == submission_id]
    
    # Calculate overall score and health
    score = calculate_adoption_score(metrics)
    health = determine_health_status(score)
    recommendations = generate_recommendations(metrics, score)
    
    return AdoptionSummary(
        submission_id=submission_id,
        rfp_id=submission["rfp_id"],
        rfp_title=submission["rfp_title"],
        vendor_name=submission["vendor_name"],
        solution_name=submission["solution_name"],
        overall_adoption_score=score,
        health_status=health,
        metrics=[AdoptionMetricResponse(**m) for m in metrics],
        recommendations=recommendations
    )


@router.get("/accepted-submissions")
async def list_accepted_submissions(
    airline_id: Optional[str] = None,
    vendor_id: Optional[str] = None
):
    """List accepted submissions available for adoption tracking."""
    submissions = list(MOCK_ACCEPTED_SUBMISSIONS.values())
    
    if airline_id:
        submissions = [s for s in submissions if s["airline_id"] == airline_id]
    if vendor_id:
        submissions = [s for s in submissions if s["vendor_id"] == vendor_id]
    
    # Enrich with adoption data
    for sub in submissions:
        metrics = [m for m in adoption_metrics.values() if m["submission_id"] == sub["id"]]
        sub["adoption_score"] = calculate_adoption_score(metrics)
        sub["health_status"] = determine_health_status(sub["adoption_score"])
        sub["has_telemetry"] = any(c["submission_id"] == sub["id"] for c in telemetry_connections.values())
    
    return {"submissions": submissions}


@router.get("/dashboard")
async def get_adoption_dashboard(
    airline_id: Optional[str] = None,
    vendor_id: Optional[str] = None,
    consultant_id: Optional[str] = None
):
    """Get aggregated adoption dashboard data."""
    # Filter submissions based on role
    submissions = list(MOCK_ACCEPTED_SUBMISSIONS.values())
    
    if airline_id:
        submissions = [s for s in submissions if s["airline_id"] == airline_id]
    if vendor_id:
        submissions = [s for s in submissions if s["vendor_id"] == vendor_id]
    # Consultants can see all
    
    # Calculate aggregates
    total_submissions = len(submissions)
    scores = []
    
    for sub in submissions:
        metrics = [m for m in adoption_metrics.values() if m["submission_id"] == sub["id"]]
        score = calculate_adoption_score(metrics)
        scores.append(score)
        sub["adoption_score"] = score
        sub["health_status"] = determine_health_status(score)
    
    avg_score = round(sum(scores) / len(scores), 1) if scores else 0
    healthy_count = sum(1 for s in scores if s >= 70)
    warning_count = sum(1 for s in scores if 40 <= s < 70)
    critical_count = sum(1 for s in scores if s < 40)
    
    return {
        "summary": {
            "total_solutions": total_submissions,
            "average_adoption_score": avg_score,
            "healthy_count": healthy_count,
            "warning_count": warning_count,
            "critical_count": critical_count
        },
        "solutions": submissions,
        "top_recommendations": [
            "Review solutions with critical adoption status",
            "Schedule training for solutions below 50% adoption",
            "Consider expanding high-performing solutions to additional teams"
        ]
    }
