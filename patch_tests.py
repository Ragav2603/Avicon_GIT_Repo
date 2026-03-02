import os

with open("backend/tests/test_upload_security.py", "r") as f:
    content = f.read()

content = content.replace('patch("aiofiles.open", new_callable=AsyncMock) as mocked_file:\n            mocked_file.return_value.__aenter__.return_value.write = AsyncMock()', 'patch("aiofiles.open") as mocked_file:\n            mock_file_obj = MagicMock()\n            mock_file_obj.__aenter__.return_value.write = AsyncMock()\n            mocked_file.return_value = mock_file_obj')

content = content.replace('handle = mocked_file.return_value.__aenter__.return_value', 'handle = mock_file_obj.__aenter__.return_value')

with open("backend/tests/test_upload_security.py", "w") as f:
    f.write(content)
