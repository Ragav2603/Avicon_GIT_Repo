
import sys
import os
import asyncio
from unittest.mock import patch, MagicMock, AsyncMock
from fastapi.testclient import TestClient

# Add parent directory to path to import main
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_upload_dangerous_file():
    # Attempt to upload a .exe file
    files = {'file': ('malware.exe', b'MZ...', 'application/x-msdownload')}
    data = {'customer_id': 'test-customer'}

    # Mock parse_document to be an async function (AsyncMock)
    with patch('routers.upload.parse_document', new_callable=AsyncMock) as mock_parse:
        mock_parse.return_value = [] # Return empty list of docs
        with patch('routers.upload.process_and_store_documents', return_value=0):
            response = client.post("/upload/", files=files, data=data)

            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.json()}")

            if response.status_code == 200:
                print("VULNERABILITY CONFIRMED: .exe file was accepted!")
            else:
                print("SECURE: .exe file was rejected.")

if __name__ == "__main__":
    test_upload_dangerous_file()
