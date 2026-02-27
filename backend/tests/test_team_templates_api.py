"""
Phase 3 Team Templates API Tests
Tests for the NEW Team Templates feature:
- CRUD endpoints for team templates (all protected - return 401 without auth)
- Use template endpoint (protected)
- Categories list endpoint (protected)
- Public endpoints validation
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestTeamTemplatesEndpoints:
    """Test Team Templates CRUD endpoints - all protected"""
    
    def test_list_team_templates_requires_auth(self):
        """GET /api/team-templates — returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/team-templates")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ GET /api/team-templates returns 401 without auth")
    
    def test_list_team_templates_with_category_filter(self):
        """GET /api/team-templates?category=IFE — returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/team-templates?category=IFE")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/team-templates with category filter returns 401 without auth")
    
    def test_list_team_templates_with_search(self):
        """GET /api/team-templates?search=test — returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/team-templates?search=test")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ GET /api/team-templates with search returns 401 without auth")
    
    def test_create_team_template_requires_auth(self):
        """POST /api/team-templates — returns 401 without auth"""
        payload = {
            "title": "Test Template",
            "description": "Test description",
            "content": "Test content for the template",
            "category": "IFE",
            "tags": ["test", "ife"],
            "is_shared": True
        }
        response = requests.post(f"{BASE_URL}/api/team-templates", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ POST /api/team-templates returns 401 without auth")
    
    def test_get_single_team_template_requires_auth(self):
        """GET /api/team-templates/{id} — returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/team-templates/some-template-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ GET /api/team-templates/{id} returns 401 without auth")
    
    def test_update_team_template_requires_auth(self):
        """PUT /api/team-templates/{id} — returns 401 without auth"""
        payload = {
            "title": "Updated Template Title",
            "description": "Updated description"
        }
        response = requests.put(f"{BASE_URL}/api/team-templates/some-template-id", json=payload)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ PUT /api/team-templates/{id} returns 401 without auth")
    
    def test_delete_team_template_requires_auth(self):
        """DELETE /api/team-templates/{id} — returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/team-templates/some-template-id")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ DELETE /api/team-templates/{id} returns 401 without auth")
    
    def test_use_team_template_requires_auth(self):
        """POST /api/team-templates/{id}/use — returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/team-templates/some-template-id/use")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ POST /api/team-templates/{id}/use returns 401 without auth")
    
    def test_list_categories_requires_auth(self):
        """GET /api/team-templates/categories/list — returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/team-templates/categories/list")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data, "Expected error detail in response"
        print("✅ GET /api/team-templates/categories/list returns 401 without auth")


class TestTeamTemplatesWithInvalidToken:
    """Test Team Templates endpoints reject invalid auth tokens"""
    
    def test_list_with_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.get(f"{BASE_URL}/api/team-templates", headers=headers)
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"
        print("✅ Team templates list rejects invalid tokens")
    
    def test_create_with_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token_123"}
        payload = {
            "title": "Test",
            "content": "Test content",
            "category": "General"
        }
        response = requests.post(f"{BASE_URL}/api/team-templates", json=payload, headers=headers)
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"
        print("✅ Team templates create rejects invalid tokens")
    
    def test_use_template_with_invalid_token(self):
        headers = {"Authorization": "Bearer invalid_token_123"}
        response = requests.post(f"{BASE_URL}/api/team-templates/some-id/use", headers=headers)
        assert response.status_code == 401, f"Expected 401 with invalid token, got {response.status_code}"
        print("✅ Use template rejects invalid tokens")


class TestPublicEndpointsStillWork:
    """Verify public endpoints still work correctly"""
    
    def test_health_endpoint_is_public(self):
        """GET /api/health — returns 200 healthy"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert data.get("status") == "healthy", "Expected status healthy"
        assert "services" in data, "Expected services in response"
        services = data["services"]
        assert "mongodb" in services, "Expected mongodb service"
        assert services["mongodb"] == "healthy", "Expected mongodb healthy"
        print("✅ Health endpoint returns 200 with healthy status")
    
    def test_rfp_templates_endpoint_is_public(self):
        """GET /api/rfp-response/templates — returns 200 with 6 aviation templates"""
        response = requests.get(f"{BASE_URL}/api/rfp-response/templates")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Expected list response"
        assert len(data) == 6, f"Expected 6 templates, got {len(data)}"
        
        # Verify all expected categories are present
        expected_categories = {"IFE", "MRO", "Catering", "Ground Handling", "Connectivity", "Digital"}
        actual_categories = {t["category"] for t in data}
        assert actual_categories == expected_categories, f"Categories mismatch: {actual_categories}"
        
        # Verify template structure
        for tmpl in data:
            assert "id" in tmpl, "Template should have id"
            assert "name" in tmpl, "Template should have name"
            assert "category" in tmpl, "Template should have category"
            assert "description" in tmpl, "Template should have description"
            assert "prompt_template" in tmpl, "Template should have prompt_template"
        
        print("✅ RFP templates endpoint returns 200 with 6 aviation templates")


class TestPreviousEndpointsStillProtected:
    """Verify previous endpoints are still protected"""
    
    def test_stats_still_protected(self):
        response = requests.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Stats endpoint still returns 401 without auth")
    
    def test_drafts_still_protected(self):
        response = requests.get(f"{BASE_URL}/api/drafts")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Drafts endpoint still returns 401 without auth")
    
    def test_kb_folders_still_protected(self):
        response = requests.get(f"{BASE_URL}/api/kb/folders")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ KB folders endpoint still returns 401 without auth")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
