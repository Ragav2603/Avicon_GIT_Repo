# Sentinel's Journal

## 2025-02-28 - FastAPI UploadFile Memory Exhaustion
**Vulnerability:** Denial of Service (DoS) via Memory Exhaustion (OOM) in file upload endpoint.
**Learning:** `await UploadFile.read()` loads the entire file content into memory, even if the file is spooled to disk by Starlette/FastAPI. This allows an attacker to crash the server by uploading a large file (e.g., 10GB).
**Prevention:** Always stream file uploads using `await file.read(chunk_size)` loop and check the accumulated size against a limit during the loop.
## 2025-02-28 - FastAPI UploadFile Memory Exhaustion (KB Router)
**Vulnerability:** Similar to the previous entry, the `/api/kb/folders/{folder_id}/upload` endpoint in `backend/routers/knowledge_base.py` used `await file.read()` which loads the entire file into memory before checking its size, creating a DoS via OOM vulnerability.
**Learning:** `UploadFile.read()` must be avoided entirely in FastAPI routers accepting files from untrusted users. In addition, when testing this behavior, `starlette.datastructures.UploadFile.read` can be tricky to mock reliably due to Starlette's `TestClient` creating `SpooledTemporaryFile` wrappers. Unit tests verifying stream behavior must be careful not to pollute `sys.modules` at the top level when mocking dependencies (like motor or database routers), otherwise it breaks parallel/subsequent tests in the pytest suite.
**Prevention:** Always stream file uploads using `await file.read(chunk_size)` and check the accumulated size incrementally. Use scoped patching (e.g., `setUpClass` or `@patch`) for `sys.modules` instead of global assignment in test files.

## $(date +%Y-%m-%d) - Unbounded Rate Limiter Memory Exhaustion DoS
**Vulnerability:** The `RateLimiterMiddleware` used a standard `collections.defaultdict(list)` to store API request timelines per client IP/user. Since there was no limit on the number of keys the dictionary could hold, an attacker could spoof thousands of distinct IPs (e.g., via `X-Forwarded-For`), causing the server to consume unbounded memory and eventually crash (Denial of Service).
**Learning:** In-memory stores used for per-client state (like rate limits, session data, or connection trackers) must always have a strictly enforced maximum size or eviction policy to prevent memory exhaustion DoS attacks.
**Prevention:** Always use bounded cache structures like `cachetools.LRUCache(maxsize=...)` instead of unbounded `dict` or `defaultdict` for data scaled by external client inputs.
