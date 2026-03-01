# Sentinel's Journal

## 2025-02-28 - FastAPI UploadFile Memory Exhaustion
**Vulnerability:** Denial of Service (DoS) via Memory Exhaustion (OOM) in file upload endpoint.
**Learning:** `await UploadFile.read()` loads the entire file content into memory, even if the file is spooled to disk by Starlette/FastAPI. This allows an attacker to crash the server by uploading a large file (e.g., 10GB).
**Prevention:** Always stream file uploads using `await file.read(chunk_size)` loop and check the accumulated size against a limit during the loop.

## $(date +%Y-%m-%d) - Unbounded Rate Limiter Memory Exhaustion DoS
**Vulnerability:** The `RateLimiterMiddleware` used a standard `collections.defaultdict(list)` to store API request timelines per client IP/user. Since there was no limit on the number of keys the dictionary could hold, an attacker could spoof thousands of distinct IPs (e.g., via `X-Forwarded-For`), causing the server to consume unbounded memory and eventually crash (Denial of Service).
**Learning:** In-memory stores used for per-client state (like rate limits, session data, or connection trackers) must always have a strictly enforced maximum size or eviction policy to prevent memory exhaustion DoS attacks.
**Prevention:** Always use bounded cache structures like `cachetools.LRUCache(maxsize=...)` instead of unbounded `dict` or `defaultdict` for data scaled by external client inputs.
