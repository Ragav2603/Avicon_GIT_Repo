import os
import unittest
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi import FastAPI
from fastapi.testclient import TestClient

from routers.health import router

app = FastAPI()
app.include_router(router)
client = TestClient(app)

class TestHealthRouter(unittest.TestCase):
    def test_root(self):
        response = client.get("/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"message": "Avicon Enterprise API", "version": "1.0.0"})

    @patch.dict(os.environ, {
        "MONGO_URL": "mongodb://localhost",
        "PINECONE_API_KEY": "fake_pinecone_key",
        "AZURE_OPENAI_API_KEY": "fake_azure_key",
        "SUPABASE_URL": "fake_supabase_url"
    })
    @patch("routers.health.AsyncIOMotorClient")
    def test_health_check_all_healthy(self, mock_motor_client):
        # Setup mock for MongoDB ping
        mock_client_instance = MagicMock()
        mock_admin = MagicMock()
        mock_admin.command = AsyncMock(return_value={"ok": 1})
        mock_client_instance.admin = mock_admin
        mock_motor_client.return_value = mock_client_instance

        response = client.get("/health")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertEqual(data["services"]["mongodb"], "healthy")
        self.assertEqual(data["services"]["pinecone"], "configured")
        self.assertEqual(data["services"]["azure_openai"], "configured")
        self.assertEqual(data["services"]["supabase"], "configured")

        # Verify motor client was closed
        mock_client_instance.close.assert_called_once()

    @patch.dict(os.environ, {
        "MONGO_URL": "mongodb://localhost",
        "PINECONE_API_KEY": "",
        "AZURE_OPENAI_API_KEY": "",
        "SUPABASE_URL": ""
    })
    @patch("routers.health.AsyncIOMotorClient")
    def test_health_check_missing_config_and_unhealthy_db(self, mock_motor_client):
        # Setup mock for MongoDB ping failure
        mock_client_instance = MagicMock()
        mock_admin = MagicMock()
        mock_admin.command = AsyncMock(side_effect=Exception("Connection failed"))
        mock_client_instance.admin = mock_admin
        mock_motor_client.return_value = mock_client_instance

        response = client.get("/health")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "degraded")
        self.assertEqual(data["services"]["mongodb"], "unhealthy")
        self.assertEqual(data["services"]["pinecone"], "not_configured")
        self.assertEqual(data["services"]["azure_openai"], "not_configured")
        self.assertEqual(data["services"]["supabase"], "not_configured")

    @patch.dict(os.environ, {
        "MONGO_URL": "mongodb://localhost",
        "PINECONE_API_KEY": "fake_pinecone_key",
        "AZURE_OPENAI_API_KEY": "fake_azure_key",
        "SUPABASE_URL": "fake_supabase_url"
    })
    @patch("routers.health.AsyncIOMotorClient")
    def test_health_check_db_timeout(self, mock_motor_client):
        # Setup mock for MongoDB timeout
        import asyncio
        mock_client_instance = MagicMock()
        mock_admin = MagicMock()
        mock_admin.command = AsyncMock(side_effect=asyncio.TimeoutError("Timeout"))
        mock_client_instance.admin = mock_admin
        mock_motor_client.return_value = mock_client_instance

        response = client.get("/health")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["status"], "degraded")
        self.assertEqual(data["services"]["mongodb"], "unhealthy")
        self.assertEqual(data["services"]["pinecone"], "configured")

if __name__ == "__main__":
    unittest.main()
