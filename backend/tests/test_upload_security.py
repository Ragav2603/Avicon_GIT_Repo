import sys
import unittest
from unittest.mock import MagicMock, patch, mock_open, AsyncMock
from starlette.middleware.base import BaseHTTPMiddleware

# Define a mock middleware that does nothing but pass through
class MockAuditMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, db=None):
        super().__init__(app)

    async def dispatch(self, request, call_next):
        return await call_next(request)

# Mock modules before importing app
parser_mock = MagicMock()
parser_mock.parse_document = AsyncMock(return_value=[])
sys.modules["services.document_parser"] = parser_mock

sys.modules["services.rag_engine"] = MagicMock()
sys.modules["motor.motor_asyncio"] = MagicMock()

# Mock middleware.audit module
mock_audit = MagicMock()
mock_audit.AuditLoggingMiddleware = MockAuditMiddleware
sys.modules["middleware.audit"] = mock_audit

# Patch load_dotenv to avoid errors
with patch("dotenv.load_dotenv"):
    # We need to set environment variables required by server.py
    with patch.dict("os.environ", {"MONGO_URL": "mongodb://mock", "DB_NAME": "mock_db"}):
        from server import app
        from fastapi.testclient import TestClient

client = TestClient(app)

class TestUploadSecurity(unittest.TestCase):
    def setUp(self):
        self.client = client
        # Patch verify_supabase_token
        self.auth_patcher = patch("middleware.auth.verify_supabase_token")
        self.mock_auth = self.auth_patcher.start()
        self.mock_auth.return_value = {"sub": "test_user", "role": "authenticated"}

    def tearDown(self):
        self.auth_patcher.stop()

    def test_upload_normal_file(self):
        files = {"file": ("test.txt", b"Hello World", "text/plain")}
        headers = {"Authorization": "Bearer mock_token"}
        # Mock open to capture file write
        with patch("builtins.open", mock_open()) as mocked_file:
            # We also need to mock Path.mkdir to avoid filesystem access
            with patch("pathlib.Path.mkdir"), \
                 patch("pathlib.Path.exists", return_value=True), \
                 patch("pathlib.Path.unlink") as mock_unlink:

                response = self.client.post("/api/documents/upload", files=files, headers=headers)

                self.assertEqual(response.status_code, 200, response.text)

                # Verify content was written
                handle = mocked_file()
                handle.write.assert_called_with(b"Hello World")

                # Verify cleanup (unlink) should NOT be called on success (documents.py unlinks in finally block)
                # Wait, existing code: finally: if temp_path.exists(): temp_path.unlink()
                # So it IS called on success too.
                mock_unlink.assert_called()

    def test_upload_filename_sanitization(self):
        # Filename with path traversal characters
        files = {"file": ("../../etc/passwd.txt", b"content", "text/plain")}
        headers = {"Authorization": "Bearer mock_token"}

        with patch("builtins.open", mock_open()) as mocked_file:
            with patch("pathlib.Path.mkdir"), \
                 patch("pathlib.Path.exists", return_value=True), \
                 patch("pathlib.Path.unlink"):

                response = self.client.post("/api/documents/upload", files=files, headers=headers)
                self.assertEqual(response.status_code, 200)

                # Check filename used in open
                args, _ = mocked_file.call_args
                path_arg = str(args[0])
                # Should contain uuid and _passwd.txt (sanitized from passwd)
                self.assertTrue("_passwd.txt" in path_arg)
                # Should not contain "etc" or ".."
                self.assertFalse(".." in path_arg)
                self.assertFalse("/etc/" in path_arg)

    def test_upload_sanitize_special_chars(self):
        # Test special characters
        files = {"file": ("foo#bar$.txt", b"content", "text/plain")}
        headers = {"Authorization": "Bearer mock_token"}

        with patch("builtins.open", mock_open()) as mocked_file:
            with patch("pathlib.Path.mkdir"), \
                 patch("pathlib.Path.exists", return_value=True), \
                 patch("pathlib.Path.unlink"):

                response = self.client.post("/api/documents/upload", files=files, headers=headers)
                self.assertEqual(response.status_code, 200)

                args, _ = mocked_file.call_args
                path_arg = str(args[0])
                # foo#bar$ -> foo_bar_
                # stem is foo#bar$, sanitized to foo_bar_
                self.assertTrue("_foo_bar_.txt" in path_arg)

    def test_upload_large_file_rejection(self):
        # Simulate large file by patching UploadFile.read
        # 10MB chunks * 6 = 60MB > 50MB limit
        chunks = [b"A" * (10 * 1024 * 1024)] * 6
        chunks_iter = iter(chunks)

        async def mock_read(self, size=-1):
            try:
                return next(chunks_iter)
            except StopIteration:
                return b""

        # We patch the read method on the UploadFile class used by FastAPI (Starlette)
        with patch("starlette.datastructures.UploadFile.read", mock_read):
            files = {"file": ("large.txt", b"ignored", "text/plain")}
            headers = {"Authorization": "Bearer mock_token"}

            with patch("builtins.open", mock_open()):
                with patch("pathlib.Path.mkdir"), \
                     patch("pathlib.Path.exists", return_value=True), \
                     patch("pathlib.Path.unlink") as mock_unlink:

                    response = self.client.post("/api/documents/upload", files=files, headers=headers)

                    self.assertEqual(response.status_code, 400)
                    self.assertIn("exceeds 50MB", response.json()["detail"])
                    # Verify cleanup was called
                    mock_unlink.assert_called()
