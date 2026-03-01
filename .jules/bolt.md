## 2024-05-18 - Prevent Memory Exhaustion DoS in FastAPI
**Learning:** To prevent memory exhaustion DoS in FastAPI file uploads, use `await file.read(chunk_size)` in a loop to enforce size limits incrementally, rather than `await file.read()` which loads the entire file into memory.
**Action:** When working with file uploads in FastAPI or similar frameworks, avoid reading the whole file into memory at once. Instead, stream the file contents in chunks and check the cumulative size against the limit as you write to the destination.

## 2025-03-01 - [Avoid Repeated HTTP Client Instantiation]
**Learning:** Re-instantiating an `httpx.AsyncClient` for each request skips TCP connection pooling, drastically reducing throughput and increasing response latency.
**Action:** When making frequent external API calls (such as in Auth middleware), utilize a lazily-initialized singleton `httpx.AsyncClient` with defined connection limits to reuse connections and increase performance significantly.
