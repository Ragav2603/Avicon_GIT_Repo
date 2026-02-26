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
├── routers/ (health, query, documents, knowledge_base, rfp_response, stats, drafts, integrations)
├── models/ (schemas.py - Pydantic V2)
└── tests/ (test_platform_apis.py, test_phase2_apis.py)
```

### Frontend Structure
```
frontend/src/
├── pages/platform/ (HomePage, AgentsPage, WorkflowsPage, KnowledgeBasePage, MeetingsPage, ResponsePage)
├── components/platform/ (PlatformLayout, FolderExplorer, FileUploadZone, IntegrationsModal, ContextualChat, ResponseWizard, DraftPresence, DraftList)
├── components/ui/ (Shadcn components)
├── hooks/ (useAuth, useProjects, useToast)
└── integrations/supabase/ (client.ts)
```

### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | No | Service health check |
| GET | /api/rfp-response/templates | No | 6 aviation RFP templates |
| GET | /api/stats | JWT | Live platform stats (docs, folders, queries, drafts) |
| POST | /api/kb/folders | JWT | Create KB folder |
| GET | /api/kb/folders | JWT | List KB folders |
| POST | /api/kb/folders/{id}/upload | JWT | Upload document to folder |
| GET | /api/kb/limits | JWT | Get usage vs limits |
| POST | /api/rfp-response/draft | JWT | Generate AI RFP response |
| POST | /api/rfp-response/chat | JWT | Contextual AI chat with KB docs |
| GET | /api/drafts | JWT | List saved drafts |
| POST | /api/drafts | JWT | Create draft |
| GET | /api/drafts/{id} | JWT | Get draft |
| PUT | /api/drafts/{id} | JWT | Update draft (auto-save) |
| DELETE | /api/drafts/{id} | JWT | Delete draft |
| POST | /api/drafts/{id}/presence | JWT | Presence heartbeat |
| GET | /api/drafts/{id}/presence | JWT | Get active editors |
| GET | /api/drafts/{id}/versions | JWT | Draft version history |
| GET | /api/integrations | JWT | List provider connections |
| POST | /api/integrations/{provider}/connect | JWT | Connect provider (stub) |
| DELETE | /api/integrations/{provider}/disconnect | JWT | Disconnect provider |
| GET | /api/integrations/{provider}/files | JWT | Browse provider files (mock) |
| POST | /api/integrations/{provider}/sync/{id} | JWT | Sync file to KB (stub) |

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
- 6 aviation-specific RFP templates
- Conditional Response tab (vendor-only)
- Comprehensive data-testid attributes on all interactive elements

### Phase 4: Collaboration, Stats & Integrations (COMPLETE - Feb 2026)
- **Live stat cards** on Platform Home: Documents, Folders, Queries Today, Active Drafts
- **Collaborative RFP drafts**: Auto-save (1.5s debounce), presence heartbeat (10s), version history (last 20)
- **Draft management**: Full CRUD with title, content, template association, document references
- **DraftPresence component**: Shows avatars of active editors + "Live editing" badge
- **DraftList component**: Version badges, time-relative display, delete/select
- **External integrations UI**: Sheet panel with 3 providers (SharePoint, OneDrive, Google Docs)
- **Connection flow**: Connect/Disconnect buttons, file browser, sync-to-KB action
- **Backend**: 3 new routers (stats, drafts, integrations) with full Pydantic validation
- All 32 backend tests passed, all frontend UI tests verified

## Pending / Backlog

### P1 - Upcoming
- Wire Azure OpenAI RAG to KB chat and RFP draft generation with document content extraction (endpoints exist but may need Azure config)
- Implement real OAuth for SharePoint/OneDrive/Google Docs (requires provider API keys)

### P2 - Future
- Full Playwright E2E test suite covering authenticated flows
- Real-time presence via WebSocket (currently polling at 10s)
- Draft commenting / annotation
- Email notifications for draft changes
- Refactoring: consolidate backend directory, cleanup unused files

## Security Compliance
- SOC2: Audit logging, access controls, encryption in transit
- GDPR: PII auto-redaction before LLM, data residency awareness

## 3rd Party Integrations
- Azure OpenAI (GPT-4o + text-embedding-ada-002) - User API Key
- Pinecone Serverless - User API Key
- Supabase (PostgreSQL, Auth) - User API Key
- MongoDB - Audit logging + KB data via motor
- GitHub Actions - CI/CD

## MOCKED Features
- Integration connect endpoints simulate OAuth success
- Integration file browser returns mock files
- Integration sync simulates success without actual file download
- RAG endpoints fall back to error messages if Azure OpenAI is unavailable
