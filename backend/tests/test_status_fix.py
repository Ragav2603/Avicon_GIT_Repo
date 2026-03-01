import pytest
from fastapi.testclient import TestClient
from server import app
import os

os.environ["SUPABASE_URL"] = "http://test-supabase-url"
os.environ["SUPABASE_ANON_KEY"] = "test-anon-key"

client = TestClient(app)

def test_status_endpoint_no_db_write():
    response = client.post("/api/status", json={"client_name": "test-client"})
    assert response.status_code == 200
    data = response.json()
    assert data["client_name"] == "test-client"
    assert "id" in data
    assert "timestamp" in data
