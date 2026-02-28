## 2024-05-18 - Prevent Memory Exhaustion DoS in FastAPI
**Learning:** To prevent memory exhaustion DoS in FastAPI file uploads, use `await file.read(chunk_size)` in a loop to enforce size limits incrementally, rather than `await file.read()` which loads the entire file into memory.
**Action:** When working with file uploads in FastAPI or similar frameworks, avoid reading the whole file into memory at once. Instead, stream the file contents in chunks and check the cumulative size against the limit as you write to the destination.
