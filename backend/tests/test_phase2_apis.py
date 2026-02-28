"""
Phase 2 API Tests - New Features Testing
Tests for:
- Stats endpoint (protected - returns 401 without auth)
- Drafts CRUD endpoints (protected - returns 401 without auth)
- Integrations endpoints (protected - returns 401 without auth)
- Public endpoint validations
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestStatsEndpoint:
    """Test platform stats endpoint - protected, returns 401 without auth"""
    
    def test_stats_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ Stats endpoint returns 401 without auth")
    
    def test_stats_with_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.get(f"{BASE_URL}/api/stats", headers=headers)
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"
        print("✅ Stats endpoint rejects invalid tokens")


class TestDraftsEndpoints:
    """Test draft CRUD endpoints - all protected"""
    
    def test_list_drafts_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/drafts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ GET /api/drafts returns 401 without auth")
    
    def test_create_draft_requires_auth(self):
        payload = {"title": "Test Draft", "content": "Test content"}
        response = requests.post(f"{BASE_URL}/api/drafts", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/drafts returns 401 without auth")
    
    def test_get_single_draft_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/drafts/some-draft-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/drafts/{id} returns 401 without auth")
    
    def test_update_draft_requires_auth(self):
        payload = {"title": "Updated Title"}
        response = requests.put(f"{BASE_URL}/api/drafts/some-draft-id", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ PUT /api/drafts/{id} returns 401 without auth")
    
    def test_delete_draft_requires_auth(self):
        response = requests.delete(f"{BASE_URL}/api/drafts/some-draft-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ DELETE /api/drafts/{id} returns 401 without auth")
    
    def test_draft_presence_requires_auth(self):
        payload = {"action": "viewing"}
        response = requests.post(f"{BASE_URL}/api/drafts/some-draft-id/presence", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/drafts/{id}/presence returns 401 without auth")
    
    def test_get_draft_presence_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/drafts/some-draft-id/presence")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/drafts/{id}/presence returns 401 without auth")
    
    def test_draft_versions_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/drafts/some-draft-id/versions")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/drafts/{id}/versions returns 401 without auth")


class TestIntegrationsEndpoints:
    """Test integrations endpoints - all protected"""
    
    def test_list_integrations_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/integrations")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ GET /api/integrations returns 401 without auth")
    
    def test_connect_sharepoint_requires_auth(self):
        payload = {"provider": "sharepoint"}
        response = requests.post(f"{BASE_URL}/api/integrations/sharepoint/connect", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/integrations/sharepoint/connect returns 401 without auth")
    
    def test_connect_onedrive_requires_auth(self):
        payload = {"provider": "onedrive"}
        response = requests.post(f"{BASE_URL}/api/integrations/onedrive/connect", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/integrations/onedrive/connect returns 401 without auth")
    
    def test_connect_gdocs_requires_auth(self):
        payload = {"provider": "gdocs"}
        response = requests.post(f"{BASE_URL}/api/integrations/gdocs/connect", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/integrations/gdocs/connect returns 401 without auth")
    
    def test_disconnect_sharepoint_requires_auth(self):
        response = requests.delete(f"{BASE_URL}/api/integrations/sharepoint/disconnect")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ DELETE /api/integrations/sharepoint/disconnect returns 401 without auth")
    
    def test_list_provider_files_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/integrations/sharepoint/files")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/integrations/sharepoint/files returns 401 without auth")
    
    def test_sync_file_requires_auth(self):
        response = requests.post(f"{BASE_URL}/api/integrations/sharepoint/sync/file-123")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ POST /api/integrations/sharepoint/sync/{file_id} returns 401 without auth")


class TestPublicEndpoints:
    """Test public endpoints work correctly without auth"""
    
    def test_health_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy"
        assert "services" in data
        assert len(data["services"]) == 4
        print("✅ Health endpoint returns 200 with 4 services")
    
    def test_templates_endpoint(self):
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 6, f"Expected 6 templates, got {len(data)}"
        
        # Verify template structure
        expected_categories = {"IFE", "MRO", "Catering", "Ground Handling", "Connectivity", "Digital"}
        actual_categories = {t["category"] for t in data}
        assert actual_categories == expected_categories, "Categories mismatch"
        print("✅ Templates endpoint returns 200 with 6 templates")


class TestInvalidProviders:
    """Test that invalid providers are handled correctly"""
    
    def test_invalid_provider_connect(self):
        # This should return 401 first (auth check) before 400 (bad provider)
        payload = {"provider": "dropbox"}
        response = requests.post(f"{BASE_URL}/api/integrations/dropbox/connect", json=payload)
        # Should return 401 without auth
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Invalid provider connect returns 401 (auth checked first)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
