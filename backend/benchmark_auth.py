import asyncio
import time
import os
import sys
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler

class MockSupabaseHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(b'{"id": "123", "email": "test@test.com", "role": "authenticated"}')
    def log_message(self, format, *args):
        pass # Suppress logging

def start_server():
    server = HTTPServer(('127.0.0.1', 8001), MockSupabaseHandler)
    server.serve_forever()

# Start local server in a daemon thread
server_thread = threading.Thread(target=start_server, daemon=True)
server_thread.start()
time.sleep(1) # Wait for server to start

import httpx

os.environ["SUPABASE_URL"] = "http://127.0.0.1:8001"
os.environ["SUPABASE_ANON_KEY"] = "test"

# Import from auth middleware
sys.path.insert(0, os.path.abspath('backend'))
from middleware.auth import verify_supabase_token

async def run_benchmark():
    print("Warming up...")
    for _ in range(5):
        await verify_supabase_token("dummy")

    print("Benchmarking...")
    start = time.time()
    for _ in range(100):
        await verify_supabase_token("dummy")
    duration = time.time() - start
    print(f"Total time for 100 requests (baseline): {duration:.4f}s")
    print(f"Requests per second: {100 / duration:.2f}")

if __name__ == "__main__":
    asyncio.run(run_benchmark())
