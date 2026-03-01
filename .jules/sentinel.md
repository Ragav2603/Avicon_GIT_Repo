# Sentinel's Journal

## 2025-02-28 - FastAPI UploadFile Memory Exhaustion
**Vulnerability:** Denial of Service (DoS) via Memory Exhaustion (OOM) in file upload endpoint.
**Learning:** `await UploadFile.read()` loads the entire file content into memory, even if the file is spooled to disk by Starlette/FastAPI. This allows an attacker to crash the server by uploading a large file (e.g., 10GB).
**Prevention:** Always stream file uploads using `await file.read(chunk_size)` loop and check the accumulated size against a limit during the loop.

## 2025-02-28 - Hardcoded Supabase Credentials in Frontend
**Vulnerability:** Hardcoded API keys and URLs in client-side code fallbacks.
**Learning:** Hardcoding `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_URL` as fallbacks when environment variables are missing is a security risk. While publishable keys are meant for the client, hardcoding them prevents key rotation and points to bad security practices. Additionally, hardcoded URLs can leak the specific Supabase project instance unnecessarily.
**Prevention:** Never provide fallback hardcoded credentials. Always enforce the presence of required environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`) and explicitly throw an error or handle gracefully if they are missing.
