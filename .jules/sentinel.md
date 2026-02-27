# Sentinel's Journal

## 2025-02-28 - FastAPI UploadFile Memory Exhaustion
**Vulnerability:** Denial of Service (DoS) via Memory Exhaustion (OOM) in file upload endpoint.
**Learning:** `await UploadFile.read()` loads the entire file content into memory, even if the file is spooled to disk by Starlette/FastAPI. This allows an attacker to crash the server by uploading a large file (e.g., 10GB).
**Prevention:** Always stream file uploads using `await file.read(chunk_size)` loop and check the accumulated size against a limit during the loop.
