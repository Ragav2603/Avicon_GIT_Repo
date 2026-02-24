# Avicon Enterprise Platform — Production-Ready Architecture

## Overview
Multi-tenant RAG-powered procurement intelligence platform for the aviation industry.
SOC2/GDPR audit-ready with namespace-isolated AI capabilities.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn (ASGI), Motor (async MongoDB)
- **RAG Engine**: LangChain LCEL (async), Azure OpenAI (GPT-4o + text-embedding-ada-002)
- **Document Processing**: LlamaParse + MarkdownHeaderTextSplitter
- **Vector DB**: Pinecone Serverless (namespace-based multi-tenancy)
- **Auth DB**: Supabase (PostgreSQL) with JWT-based auth
- **Edge Layer**: Supabase Edge Functions (Deno/TypeScript) — secure proxy/auth gate
- **Frontend**: React 18, TypeScript, TanStack Query, Tailwind CSS, Shadcn/UI
- **CI/CD**: GitHub Actions with zero-downtime Azure App Service slot swap

## Architecture

### Security Layers (Request Flow)
```
Client → CORS → Rate Limiter → Request Validator → JWT Auth → Audit Logger → Router
```

### Multi-Tenancy Model
- Every Supabase JWT contains `user.id` → becomes `customer_id`
- `customer_id` = Pinecone namespace key (strict data isolation)
- Edge Functions enforce server-derived identity (never from client input)
- Audit logs capture every AI query and document access per tenant

### Backend Structure
```
backend/
├── server.py                      # FastAPI app with middleware stack
├── startup.sh                     # Azure App Service zero-downtime startup
├── middleware/
│   ├── auth.py                    # Supabase JWT verification (server-side getUser)
│   ├── rate_limiter.py            # Sliding window (burst/minute/hour)
│   ├── request_validator.py       # Content-Type, body size validation
│   └── audit.py                   # MongoDB-persisted audit trail
├── services/
│   ├── rag_engine.py              # Async LCEL chain with query caching
│   ├── document_parser.py         # LlamaParse with PII masking
│   └── pii_masker.py              # Regex-based PII redaction (GDPR)
├── routers/
│   ├── health.py                  # /api/health with dependency checks
│   ├── query.py                   # POST /api/query/ (async RAG)
│   └── documents.py               # POST /api/documents/upload
└── models/
    └── schemas.py                 # Pydantic V2 request/response models
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/ | No | Root info |
| GET | /api/health | No | Service health check |
| GET/POST | /api/status | No | Legacy status |
| POST | /api/query/ | JWT | RAG query (namespace-isolated) |
| POST | /api/documents/upload | JWT | Document upload + embedding |
| GET | /api/docs | No | Swagger UI |

### Frontend Architecture
- ErrorBoundary wrapping entire app
- WCAG 2.1 AA: skip-to-content, ARIA labels, focus rings
- TanStack Query with optimistic mutations
- All URLs from environment variables (zero hardcoding)
- Enterprise design system: glassmorphism, subtle gradients, 4px grid

## Security Compliance
- **SOC2**: Audit logging, access controls, encryption in transit
- **GDPR**: PII auto-redaction before LLM, data residency awareness
- **ISO 27001**: Security framework alignment, incident logging

## Deployment
- Azure App Service with staging → production slot swap
- GitHub Actions CI/CD pipeline (lint → type-check → build → deploy → health-check → swap)
- startup.sh with env validation and graceful startup
