## 2025-03-01 - Non-blocking concurrent PII masking
**Learning:** CPU-bound regex loops inside an async endpoint (like `mask_pii` over many documents) block the entire asyncio event loop, heavily degrading concurrent throughput.
**Action:** Use `asyncio.get_running_loop().run_in_executor(None, func, arg)` combined with `asyncio.gather(*tasks)` to offload such tasks to the default thread pool, allowing the event loop to continue serving other requests.
