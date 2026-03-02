import sys
import unittest
import pytest
from unittest.mock import MagicMock, patch, mock_open, AsyncMock
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi import Request

# Define a mock middleware that does nothing but pass through
class MockAuditMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, db=None):
        super().__init__(app)

    async def dispatch(self, request, call_next):
        return await call_next(request)

class TestKBUploadSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Save original modules to avoid polluting other tests
        cls.original_modules = dict(sys.modules)

        # We must carefully mock the same way without breaking test_upload_security.py
        # Actually, since test_upload_security.py needs an AsyncMock for parse_document,
        # we can just provide one here to be safe if it leaks, but it's better to isolate.

        parser_mock = MagicMock()
        parser_mock.parse_document = AsyncMock(return_value=[])
        sys.modules["services.document_parser"] = parser_mock
        sys.modules["services.rag_engine"] = MagicMock()
        sys.modules["motor.motor_asyncio"] = MagicMock()

        mock_audit = MagicMock()
        mock_audit.AuditLoggingMiddleware = MockAuditMiddleware
        sys.modules["middleware.audit"] = mock_audit

        with patch("dotenv.load_dotenv"):
            with patch.dict("os.environ", {"MONGO_URL": "mongodb://mock", "DB_NAME": "mock_db"}):
                from server import app
                from fastapi.testclient import TestClient
                cls.app = app
                cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls):
        # Restore original modules
        sys.modules.clear()
        sys.modules.update(cls.original_modules)

    def setUp(self):
        self.auth_patcher = patch("middleware.auth.verify_supabase_token")
        self.mock_auth = self.auth_patcher.start()
        self.mock_auth.return_value = {"sub": "test_user", "role": "authenticated"}

    def tearDown(self):
        self.auth_patcher.stop()

    def test_kb_upload_streaming(self):
        call_count = [0]
        async def mock_read(size=-1):
            if call_count[0] == 0:
                call_count[0] += 1
                return b"test content"
            return b""

        with patch("starlette.datastructures.UploadFile.read", side_effect=mock_read) as mock_read_spy:
            self.app.state.db = MagicMock()
            future_folder = AsyncMock(return_value={"id": "folder_123", "user_id": "test_user"})
            self.app.state.db.kb_folders.find_one = future_folder
            self.app.state.db.kb_documents.count_documents = AsyncMock(return_value=0)
            self.app.state.db.kb_documents.insert_one = AsyncMock()

            with patch("builtins.open", mock_open()):
                with patch("pathlib.Path.mkdir"), \
                     patch("pathlib.Path.exists", return_value=True):

                    files = {"file": ("test.txt", b"test content", "text/plain")}
                    headers = {"Authorization": "Bearer mock_token"}

                    response = self.client.post("/api/kb/folders/folder_123/upload", files=files, headers=headers)

                    self.assertEqual(response.status_code, 200, response.text)

                    calls = mock_read_spy.mock_calls
                    self.assertTrue(len(calls) > 0, "File.read() was not called")

                    has_chunk_size = any(
                        len(c.args) > 0 and isinstance(c.args[0], int) and c.args[0] > 0
                        for c in calls
                    )

                    has_chunk_kwarg = any(
                        "size" in c.kwargs and isinstance(c.kwargs["size"], int) and c.kwargs["size"] > 0
                        for c in calls
                    )

                    self.assertTrue(
                        has_chunk_size or has_chunk_kwarg,
                        f"File.read() was never called with a chunk size! Calls: {calls}"
                    )
