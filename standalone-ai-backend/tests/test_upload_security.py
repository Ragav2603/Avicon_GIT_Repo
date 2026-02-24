
import sys
import os
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Add parent directory to path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_upload_valid_file():
    print("\n[TEST] Upload Valid File (.txt)")
    files = {'file': ('notes.txt', b'This is a test file.', 'text/plain')}
    data = {'customer_id': 'test-customer'}

    with patch('routers.upload.parse_document', new_callable=AsyncMock) as mock_parse:
        mock_parse.return_value = []
        with patch('routers.upload.process_and_store_documents', return_value=1):
            response = client.post("/upload/", files=files, data=data)
            print(f"Status: {response.status_code}")
            assert response.status_code == 200
            assert response.json()['status'] == 'success'
            print("PASS: Valid file uploaded successfully.")

def test_upload_invalid_extension():
    print("\n[TEST] Upload Invalid Extension (.exe)")
    files = {'file': ('malware.exe', b'MZ...', 'application/x-msdownload')}
    data = {'customer_id': 'test-customer'}

    response = client.post("/upload/", files=files, data=data)
    print(f"Status: {response.status_code}")
    print(f"Detail: {response.json().get('detail')}")
    assert response.status_code == 400
    assert "Invalid file type" in response.json()['detail']
    print("PASS: Invalid extension rejected.")

def test_upload_large_file():
    print("\n[TEST] Upload Large File (>10MB)")
    # Create a large file content > 10MB
    large_content = b'0' * (10 * 1024 * 1024 + 1)
    files = {'file': ('large.txt', large_content, 'text/plain')}
    data = {'customer_id': 'test-customer'}

    # We mock parse_document but it shouldn't be reached
    with patch('routers.upload.parse_document', new_callable=AsyncMock) as mock_parse:
        response = client.post("/upload/", files=files, data=data)
        print(f"Status: {response.status_code}")
        print(f"Detail: {response.json().get('detail')}")
        assert response.status_code == 413
        assert "File too large" in response.json()['detail']
        print("PASS: Large file rejected.")

if __name__ == "__main__":
    test_upload_valid_file()
    test_upload_invalid_extension()
    test_upload_large_file()
