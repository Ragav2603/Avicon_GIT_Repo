## 2024-05-18 - Prevent Memory Exhaustion DoS in FastAPI
**Learning:** To prevent memory exhaustion DoS in FastAPI file uploads, use `await file.read(chunk_size)` in a loop to enforce size limits incrementally, rather than `await file.read()` which loads the entire file into memory.
**Action:** When working with file uploads in FastAPI or similar frameworks, avoid reading the whole file into memory at once. Instead, stream the file contents in chunks and check the cumulative size against the limit as you write to the destination.

## 2025-03-03 - [Async I/O in FastAPI]
**Learning:** In FastAPI async endpoints, standard `with open(..., "wb") as f:` and `f.write(...)` operations are blocking and will block the event loop, causing latency spikes for concurrent requests (especially for large files).
**Action:** Always use `aiofiles.open(...)` and `await f.write(...)` in FastAPI async routes for file operations to maintain non-blocking behavior.
## 2025-03-01 - Non-blocking concurrent PII masking
**Learning:** CPU-bound regex loops inside an async endpoint (like `mask_pii` over many documents) block the entire asyncio event loop, heavily degrading concurrent throughput.
**Action:** Use `asyncio.get_running_loop().run_in_executor(None, func, arg)` combined with `asyncio.gather(*tasks)` to offload such tasks to the default thread pool, allowing the event loop to continue serving other requests.
