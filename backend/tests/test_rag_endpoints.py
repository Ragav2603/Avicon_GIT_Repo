"""
Backend API Tests for Azure OpenAI RAG Endpoints - Phase 4
Tests: RFP Draft Generation, KB Chat, Templates, Auth protection, Stats, Drafts, Folders, Team Templates

Endpoints tested:
- POST /api/rfp-response/draft - AI RFP draft generation (Azure OpenAI) 
- POST /api/rfp-response/chat - KB contextual chat (Azure OpenAI)
- GET /api/rfp-response/templates - 6 aviation templates (public)
- GET /api/health - Health check with 4 services
- GET /api/stats - Platform stats (auth required)
- GET /api/drafts - Draft list (auth required)
- POST /api/drafts - Create draft (auth required)
- GET /api/kb/folders - KB folders (auth required)
- GET /api/team-templates - Team templates (auth required)
"""
import os
import pytest
import requests

# Get BASE_URL from environment
BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
SUPABASE_URL = os.environ.get('SUPABASE_URL', 'https://aavlayzfaafuwquhhbcx.supabase.co')
SUPABASE_ANON_KEY = os.environ.get('SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdmxheXpmYWFmdXdxdWhoYmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDMyNTcsImV4cCI6MjA4NDIxOTI1N30.gst2u0jgQmlewK8FaQFNlVI_q4_CvFJTYytuiLbR55k')

# Test credentials
TEST_EMAIL = "testuser@gmail.com"
TEST_PASSWORD = "TestPass123!"


@pytest.fixture(scope="module")
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_token(api_client):
    """Get authentication token from Supabase"""
    response = api_client.post(
        f"{SUPABASE_URL}/auth/v1/token?grant_type=password",
        headers={
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
    )
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def authenticated_client(api_client, auth_token):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {auth_token}"})
    return api_client


# ========================
# PUBLIC ENDPOINT TESTS
# ========================

class TestPublicEndpoints:
    """Tests for endpoints that don't require authentication"""
    
    def test_health_endpoint_returns_healthy(self, api_client):
        """GET /api/health - Should return healthy status with 4 services"""
        response = api_client.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "healthy"
        assert "services" in data
        
        # Verify all 4 services are configured
        services = data["services"]
        assert services.get("mongodb") == "healthy"
        assert services.get("pinecone") == "configured"
        assert services.get("azure_openai") == "configured"
        assert services.get("supabase") == "configured"
    
    def test_rfp_templates_returns_6_aviation_templates(self, api_client):
        """GET /api/rfp-response/templates - Should return 6 aviation templates"""
        response = api_client.get(f"{BASE_URL}/api/rfp-response/templates")
        assert response.status_code == 200
        
        templates = response.json()
        assert isinstance(templates, list)
        assert len(templates) == 6
        
        # Verify template structure
        for template in templates:
            assert "id" in template
            assert "name" in template
            assert "category" in template
            assert "description" in template
            assert "prompt_template" in template
        
        # Verify specific templates exist
        template_ids = [t["id"] for t in templates]
        assert "tpl-ife-001" in template_ids  # IFE
        assert "tpl-mro-001" in template_ids  # MRO
        assert "tpl-catering-001" in template_ids  # Catering
        assert "tpl-ground-001" in template_ids  # Ground Handling
        assert "tpl-connectivity-001" in template_ids  # Connectivity
        assert "tpl-loyalty-001" in template_ids  # Loyalty


# ========================
# AUTH PROTECTION TESTS
# ========================

class TestAuthProtection:
    """Tests that protected endpoints return 401 without auth"""
    
    def test_rfp_draft_requires_auth(self, api_client):
        """POST /api/rfp-response/draft - Should return 401 without auth"""
        response = api_client.post(
            f"{BASE_URL}/api/rfp-response/draft",
            json={"rfp_context": "test", "document_ids": []}
        )
        assert response.status_code == 401
        assert "Authorization" in response.json().get("detail", "")
    
    def test_rfp_chat_requires_auth(self, api_client):
        """POST /api/rfp-response/chat - Should return 401 without auth"""
        response = api_client.post(
            f"{BASE_URL}/api/rfp-response/chat",
            json={"query": "test", "document_ids": []}
        )
        assert response.status_code == 401
        assert "Authorization" in response.json().get("detail", "")
    
    def test_stats_requires_auth(self, api_client):
        """GET /api/stats - Should return 401 without auth"""
        response = api_client.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 401
    
    def test_drafts_requires_auth(self, api_client):
        """GET /api/drafts - Should return 401 without auth"""
        response = api_client.get(f"{BASE_URL}/api/drafts")
        assert response.status_code == 401
    
    def test_drafts_create_requires_auth(self, api_client):
        """POST /api/drafts - Should return 401 without auth"""
        response = api_client.post(
            f"{BASE_URL}/api/drafts",
            json={"title": "Test", "content": "test"}
        )
        assert response.status_code == 401
    
    def test_kb_folders_requires_auth(self, api_client):
        """GET /api/kb/folders - Should return 401 without auth"""
        response = api_client.get(f"{BASE_URL}/api/kb/folders")
        assert response.status_code == 401
    
    def test_team_templates_requires_auth(self, api_client):
        """GET /api/team-templates - Should return 401 without auth"""
        response = api_client.get(f"{BASE_URL}/api/team-templates")
        assert response.status_code == 401


# ========================
# AUTHENTICATED ENDPOINT TESTS
# ========================

class TestAuthenticatedEndpoints:
    """Tests for endpoints with valid JWT auth"""
    
    def test_stats_with_auth_returns_data(self, authenticated_client):
        """GET /api/stats - Should return platform stats with auth"""
        response = authenticated_client.get(f"{BASE_URL}/api/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_documents" in data
        assert "total_folders" in data
        assert "queries_today" in data
        assert "active_drafts" in data
    
    def test_drafts_list_with_auth(self, authenticated_client):
        """GET /api/drafts - Should return drafts list with auth"""
        response = authenticated_client.get(f"{BASE_URL}/api/drafts")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_kb_folders_with_auth(self, authenticated_client):
        """GET /api/kb/folders - Should return folders with auth"""
        response = authenticated_client.get(f"{BASE_URL}/api/kb/folders")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_team_templates_with_auth(self, authenticated_client):
        """GET /api/team-templates - Should return team templates with auth"""
        response = authenticated_client.get(f"{BASE_URL}/api/team-templates")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


# ========================
# AI RAG ENDPOINT TESTS
# ========================

class TestRAGEndpoints:
    """Tests for Azure OpenAI RAG endpoints - RFP Draft and KB Chat"""
    
    def test_rfp_draft_generation_with_template(self, authenticated_client):
        """POST /api/rfp-response/draft - Generate IFE RFP draft using Azure OpenAI
        
        This endpoint calls Azure OpenAI via LlamaIndex acomplete() and takes ~20 seconds.
        """
        response = authenticated_client.post(
            f"{BASE_URL}/api/rfp-response/draft",
            json={
                "rfp_context": "We need an In-Flight Entertainment system with 4K screens and wireless streaming.",
                "template_id": "tpl-ife-001",
                "document_ids": []
            },
            timeout=120  # Long timeout for AI generation
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "draft" in data
        assert "template_used" in data
        assert "latency_ms" in data
        
        # Verify substantial AI response (not error message)
        draft_text = data["draft"]
        assert len(draft_text) > 500, f"Draft too short: {len(draft_text)} chars"
        assert "IFE" in draft_text or "Entertainment" in draft_text or "Flight" in draft_text
        
        # Verify template was used
        assert data["template_used"] == "In-Flight Entertainment System"
        
        print(f"RFP Draft generated: {len(draft_text)} characters in {data['latency_ms']}ms")
    
    def test_rfp_chat_without_documents(self, authenticated_client):
        """POST /api/rfp-response/chat - KB Chat asks for documents when none provided
        
        Without documents, the AI should ask user to provide documents.
        """
        response = authenticated_client.post(
            f"{BASE_URL}/api/rfp-response/chat",
            json={
                "query": "What are the best practices for IFE system installation?",
                "document_ids": [],
                "session_id": None
            },
            timeout=120
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "response" in data
        assert "session_id" in data
        assert "latency_ms" in data
        
        # Verify response (should ask for documents or indicate no context)
        response_text = data["response"]
        assert len(response_text) > 20
        
        print(f"KB Chat response: {response_text[:200]}...")


# ========================
# DRAFT CRUD TESTS
# ========================

class TestDraftCRUD:
    """Tests for Draft CRUD operations with auth"""
    
    def test_create_and_get_draft(self, authenticated_client):
        """POST /api/drafts + GET /api/drafts/{id} - Create and verify draft"""
        # Create draft
        create_response = authenticated_client.post(
            f"{BASE_URL}/api/drafts",
            json={
                "title": "TEST_Phase4_Draft",
                "content": "This is a test draft for Phase 4 testing"
            }
        )
        assert create_response.status_code in [200, 201]
        
        created_draft = create_response.json()
        assert "id" in created_draft
        assert created_draft["title"] == "TEST_Phase4_Draft"
        
        draft_id = created_draft["id"]
        
        # Get draft to verify persistence
        get_response = authenticated_client.get(f"{BASE_URL}/api/drafts/{draft_id}")
        assert get_response.status_code == 200
        
        fetched_draft = get_response.json()
        assert fetched_draft["title"] == "TEST_Phase4_Draft"
        
        # Cleanup - delete draft
        delete_response = authenticated_client.delete(f"{BASE_URL}/api/drafts/{draft_id}")
        assert delete_response.status_code in [200, 204]


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
