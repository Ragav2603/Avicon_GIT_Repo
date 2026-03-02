import asyncio
import time
import httpx
import uvicorn
import threading
from fastapi import FastAPI, Request

from unittest.mock import AsyncMock, MagicMock
import routers.documents
routers.documents.parse_document = AsyncMock(return_value=[])
routers.documents.process_and_store_documents = MagicMock(return_value=1)

from routers.documents import router

app = FastAPI()
app.include_router(router, prefix="/api")

@app.get("/ping")
async def ping():
    return {"ping": "pong"}

@app.middleware("http")
async def add_customer_id(request: Request, call_next):
    request.state.customer_id = "test_customer"
    response = await call_next(request)
    return response

async def run_server():
    config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="error", workers=1)
    server = uvicorn.Server(config)
    await server.serve()

def start_server():
    asyncio.run(run_server())

async def upload_file(client, file_data):
    files = {"file": ("test.txt", file_data, "text/plain")}
    resp = await client.post("http://127.0.0.1:8000/api/documents/upload", files=files)
    return resp

async def ping_loop(client, stop_event):
    latencies = []
    while not stop_event.is_set():
        start = time.time()
        await client.get("http://127.0.0.1:8000/ping")
        latencies.append(time.time() - start)
        await asyncio.sleep(0.01)
    return latencies

async def run_benchmark():
    file_data = b"0" * (45 * 1024 * 1024) # 45 MB

    async with httpx.AsyncClient(timeout=60.0, limits=httpx.Limits(max_connections=100)) as client:
        # warm up
        await upload_file(client, b"123")
        await client.get("http://127.0.0.1:8000/ping")

        stop_event = asyncio.Event()

        start = time.time()
        # 10 concurrent requests
        tasks = [upload_file(client, file_data) for _ in range(10)]
        ping_task = asyncio.create_task(ping_loop(client, stop_event))

        await asyncio.gather(*tasks)
        end = time.time()

        stop_event.set()
        latencies = await ping_task

        print(f"Total upload time: {end - start:.4f}s")
        if latencies:
            print(f"Max ping latency during upload: {max(latencies):.4f}s")
            print(f"Avg ping latency during upload: {sum(latencies)/len(latencies):.4f}s")

if __name__ == "__main__":
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(2)
    asyncio.run(run_benchmark())
