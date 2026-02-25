from datetime import datetime, timezone
from backend.models.schemas import AuditLogEntry, StatusCheck

def test_audit_log_entry_timestamp_tz():
    entry = AuditLogEntry(user_id="test_user", action="test_action")
    assert entry.timestamp.tzinfo is not None
    assert entry.timestamp.tzinfo == timezone.utc

def test_status_check_timestamp_tz():
    check = StatusCheck(client_name="test_client")
    assert check.timestamp.tzinfo is not None
    assert check.timestamp.tzinfo == timezone.utc
