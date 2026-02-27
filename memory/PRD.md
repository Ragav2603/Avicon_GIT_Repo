# Avicon Enterprise Platform — PRD

## Overview
Multi-tenant RAG-powered procurement intelligence platform for the aviation industry.
Built with Lovable UI (preserved) + enterprise backend with Azure OpenAI RAG.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn, Motor (async MongoDB)
- **RAG Engine**: LlamaIndex (TreeIndex), Azure OpenAI (GPT-4o + text-embedding-ada-002)
- **Document Processing**: pypdf, python-docx, openpyxl for text extraction
- **Vector DB**: Pinecone Serverless (namespace-based multi-tenancy)
- **Auth**: Supabase (PostgreSQL + JWT auth)
- **Frontend**: React 18, TypeScript, Vite, Tailwind, Shadcn/UI, Framer Motion, Lenis
- **CI/CD**: GitHub Actions

## Completed Phases

### Phase 1-2: Enterprise Refactor + UX (COMPLETE)
- Security middleware (JWT, PII, rate limiting, audit)
- Enterprise design system, TanStack Query, accessibility

### Phase 3: Platform Features (COMPLETE)
- KB folder CRUD, document upload, AI chat
- 6 aviation RFP templates, conditional vendor tab

### Phase 4: Collaboration & Integrations (COMPLETE)
- Live stat cards, collaborative drafts (auto-save, presence, versioning)
- External integrations UI (SharePoint, OneDrive, Google Docs stubs)

### Phase 5: Team Templates (COMPLETE)
- Template library with CRUD, org sharing, categories, tags, usage tracking
- Save as Template from drafts, Use Template to pre-fill

### Phase 6: Azure OpenAI RAG E2E (COMPLETE - Feb 2026)
- **Fixed server.py**: load_dotenv() now runs BEFORE middleware imports
- **Fixed MongoDB bool checks**: `if not db` → `if db is None` across all routers
- **New doc_extractor.py**: Extracts text from PDF, DOCX, XLSX, CSV, TXT files
- **Wired rfp_response.py**: Draft generation uses LlamaIndex `acomplete()` with Azure GPT-4o
- **Wired KB chat**: Contextual AI queries against selected documents
- **Synced with user's GitHub repo**: Lovable UI fully preserved
- Tested: 16/16 backend, all frontend passed

## MOCKED Features
- Integration connect/sync stubs (simulate OAuth, mock files)

## RAG Now REAL
- POST /api/rfp-response/draft — Calls Azure OpenAI GPT-4o (~20s, 5000+ chars)
- POST /api/rfp-response/chat — Contextual queries against KB documents

## Pending / Backlog
- Real OAuth for SharePoint/OneDrive/Google Docs
- Full E2E Playwright test suite for authenticated flows
- WebSocket presence, draft commenting, email notifications
