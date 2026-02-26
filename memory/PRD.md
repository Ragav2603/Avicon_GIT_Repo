# Avicon Enterprise Platform — PRD

## Overview
Multi-tenant RAG-powered procurement intelligence platform for the aviation industry.
SOC2/GDPR audit-ready with namespace-isolated AI capabilities.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn (ASGI), Motor (async MongoDB)
- **RAG Engine**: LangChain LCEL (async), Azure OpenAI (GPT-4o + text-embedding-ada-002)
- **Document Processing**: LlamaParse + MarkdownHeaderTextSplitter
- **Vector DB**: Pinecone Serverless (namespace-based multi-tenancy)
- **Auth DB**: Supabase (PostgreSQL) with JWT-based auth
- **Edge Layer**: Supabase Edge Functions (Deno/TypeScript) — placeholder stubs
- **Frontend**: React 18, TypeScript, TanStack Query, Tailwind CSS, Shadcn/UI, Vite
- **CI/CD**: GitHub Actions with zero-downtime Azure App Service slot swap

## Architecture

### Security Layers (Request Flow)
```
Client -> CORS -> Rate Limiter -> Request Validator -> JWT Auth -> Audit Logger -> Router
```

### Multi-Tenancy Model
- Every Supabase JWT contains `user.id` -> becomes `customer_id`
- `customer_id` = Pinecone namespace key (strict data isolation)
- Audit logs capture every AI query and document access per tenant

### Backend Structure
```
backend/
├── server.py
├── startup.sh
├── middleware/ (auth, rate_limiter, request_validator, audit)
├── services/ (rag_engine, document_parser, pii_masker)
├── routers/ (health, query, documents, knowledge_base, rfp_response)
├── models/ (schemas.py - Pydantic V2)
└── tests/ (test_platform_apis.py)
```

### Frontend Structure
```
frontend/src/
├── pages/platform/ (HomePage, AgentsPage, WorkflowsPage, KnowledgeBasePage, MeetingsPage, ResponsePage)
├── components/platform/ (PlatformLayout, FolderExplorer, FileUploadZone, IntegrationsModal, ContextualChat, ResponseWizard)
├── components/ui/ (Shadcn components)
├── hooks/ (useAuth, useProjects, useToast)
└── integrations/supabase/ (client.ts)
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Service health check (MongoDB, Pinecone, Azure, Supabase) |
| GET/POST | /api/status | No | Legacy status endpoints |
| POST | /api/query/ | JWT | RAG query (namespace-isolated) |
| POST | /api/documents/upload | JWT | Document upload + embedding |
| GET | /api/kb/folders | JWT | List user's KB folders |
| POST | /api/kb/folders | JWT | Create folder (limit enforced) |
| PUT | /api/kb/folders/{id} | JWT | Update folder |
| DELETE | /api/kb/folders/{id} | JWT | Delete folder + its documents |
| GET | /api/kb/folders/{id}/documents | JWT | List documents in folder |
| POST | /api/kb/folders/{id}/upload | JWT | Upload document to folder |
| DELETE | /api/kb/documents/{id} | JWT | Delete document |
| GET | /api/kb/limits | JWT | Get current usage vs limits |
| GET | /api/rfp-response/templates | No | List 6 aviation RFP templates |
| POST | /api/rfp-response/draft | JWT | Generate AI RFP response draft |
| POST | /api/rfp-response/chat | JWT | Contextual AI chat with KB docs |

## What's Been Implemented

### Phase 1: Enterprise Refactor & Security (COMPLETE)
- Backend restructured into modular directory
- Security middleware: JWT Auth, PII Masking, Rate Limiting, Audit Logging
- All hardcoded secrets removed
- Deployment readiness (startup.sh, CI/CD)

### Phase 2: UX Overhaul & Async RAG (COMPLETE)
- Enterprise design system (glassmorphism, gradient hero, SOC2/GDPR badges)
- TanStack Query optimistic updates
- ErrorBoundary + WCAG 2.1 AA accessibility
- Async RAG engine with query caching

### Phase 3: Platform Features & UI Refinements (COMPLETE - Feb 2026)
- Unified platform layout with sidebar navigation
- Knowledge Base: folder CRUD, document upload, Private/Organization toggle
- AI Chat: contextual chat against selected KB documents
- RFP Response Wizard: templates, web search, manual entry, AI draft generation
- 6 aviation-specific RFP templates (IFE, MRO, Catering, Ground Handling, Connectivity, Loyalty)
- Conditional Response tab (vendor-only)
- Comprehensive data-testid attributes on all interactive elements
- Backend quota enforcement (folders: 10/user, 20/org; docs: 20/user, 100/org; file size: 20MB)

## Pending / Backlog

### P1 - Upcoming
- Implement business logic inside Supabase Edge Functions (validate-limits, sync-external-provider)
- Full backend RAG wiring for KB chat and RFP draft with document content extraction

### P2 - Future
- External provider sync (SharePoint, OneDrive, Google Docs OAuth flows)
- Full Playwright E2E test suite covering authenticated flows
- Live stat cards on Platform Home (documents count, queries today, avg response time)
- Refactoring: consolidate backend directory, cleanup unused files

## Security Compliance
- **SOC2**: Audit logging, access controls, encryption in transit
- **GDPR**: PII auto-redaction before LLM, data residency awareness
- **ISO 27001**: Security framework alignment, incident logging

## 3rd Party Integrations
- **Azure OpenAI** (GPT-4o + text-embedding-ada-002) - User API Key
- **Pinecone Serverless** - User API Key
- **Supabase** (PostgreSQL, Auth, Edge Functions) - User API Key
- **MongoDB** - Audit logging via pymongo/motor
- **GitHub Actions** - CI/CD
