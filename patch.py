with open("backend/routers/documents.py", "r") as f:
    content = f.read()

content = content.replace(
"""import logging
import re
import uuid
from pathlib import Path""",
"""import logging
import re
import uuid
from pathlib import Path

import aiofiles"""
)

content = content.replace(
"""        with open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
                buffer.write(chunk)""",
"""        async with aiofiles.open(temp_path, "wb") as buffer:
            while True:
                chunk = await file.read(CHUNK_SIZE)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_FILE_SIZE:
                    raise HTTPException(status_code=400, detail="File size exceeds 50MB limit")
                await buffer.write(chunk)"""
)

with open("backend/routers/documents.py", "w") as f:
    f.write(content)
