"""
Platform API Tests - Phase 3 Testing
Tests for:
- Health endpoint (public)
- RFP Templates endpoint (public)
- KB Folders endpoint (protected - should return 401)
- KB Limits endpoint (protected - should return 401)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")


class TestHealthEndpoint:
    """Test health check endpoint - public, returns service status"""

    def test_health_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Health endpoint returns 200")

    def test_health_returns_4_services(self):
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert "services" in data, "Response missing 'services' field"
        services = data["services"]
        assert len(services) == 4, f"Expected 4 services, got {len(services)}"
        expected_services = ["mongodb", "pinecone", "azure_openai", "supabase"]
        for svc in expected_services:
            assert svc in services, f"Missing service: {svc}"
        print(f"✅ Health returns 4 services: {list(services.keys())}")

    def test_health_status_is_healthy(self):
        response = requests.get(f"{BASE_URL}/api/health")
        data = response.json()
        assert data.get("status") == "healthy", (
            f"Expected 'healthy', got {data.get('status')}"
        )
        print("✅ Overall status is 'healthy'")


class TestRFPTemplatesEndpoint:
    """Test RFP templates endpoint - public, returns aviation templates"""

    def test_templates_returns_200(self):
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✅ Templates endpoint returns 200")

    def test_templates_returns_6_items(self):
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 6, f"Expected 6 templates, got {len(data)}"
        print(f"✅ Templates returns 6 items: {[t['name'] for t in data]}")

    def test_templates_have_required_fields(self):
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        data = response.json()
        required_fields = ["id", "name", "category", "description", "prompt_template"]
        for template in data:
            for field in required_fields:
                assert field in template, f"Template missing field: {field}"
        print("✅ All templates have required fields")

    def test_templates_categories(self):
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        data = response.json()
        expected_categories = {
            "IFE",
            "MRO",
            "Catering",
            "Ground Handling",
            "Connectivity",
            "Digital",
        }
        actual_categories = {t["category"] for t in data}
        assert actual_categories == expected_categories, (
            f"Categories mismatch: {actual_categories}"
        )
        print(f"✅ Templates cover all aviation categories: {actual_categories}")


class TestProtectedKBEndpoints:
    """Test KB endpoints - protected, should return 401 without auth"""

    def test_kb_folders_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/kb/folders")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ KB folders endpoint returns 401 without auth")

    def test_kb_limits_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/kb/limits")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ KB limits endpoint returns 401 without auth")

    def test_kb_folders_with_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.get(f"{BASE_URL}/api/kb/folders", headers=headers)
        # Should still return 401 with invalid token
        assert response.status_code == 401, (
            f"Expected 401 with invalid token, got {response.status_code}"
        )
        print("✅ KB folders rejects invalid tokens")

    def test_kb_folder_documents_requires_auth(self):
        response = requests.get(f"{BASE_URL}/api/kb/folders/test-folder-id/documents")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ KB folder documents endpoint returns 401 without auth")


class TestRootEndpoint:
    """Test root API endpoint"""

    def test_root_returns_message(self):
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert "message" in data, "Expected 'message' in response"
        assert data["message"] == "Avicon Enterprise API", (
            f"Unexpected message: {data['message']}"
        )
        print("✅ Root endpoint returns correct message")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
