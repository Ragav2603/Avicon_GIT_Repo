from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import sys

# Bootstrap for nested directory imports on Azure
sys.path.append(os.path.dirname(os.path.realpath(__file__)))

from routers import upload, query

app = FastAPI(
    title="Avicon Customer AI Agent Backend",
    description="Backend service for Customer Specific AI Agents using RAG",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(query.router)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Avicon AI Backend"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
