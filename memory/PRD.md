# Avicon Enterprise Platform — PRD

## Overview
Multi-tenant RAG-powered procurement intelligence platform for the aviation industry.
SOC2/GDPR audit-ready with namespace-isolated AI capabilities.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn (ASGI), Motor (async MongoDB)
- **RAG Engine**: LangChain LCEL (async), Azure OpenAI (GPT-4o + text-embedding-ada-002)
- **Vector DB**: Pinecone Serverless (namespace-based multi-tenancy)
- **Auth DB**: Supabase (PostgreSQL) with JWT-based auth
- **Frontend**: React 18, TypeScript, TanStack Query, Tailwind CSS, Shadcn/UI, Vite
- **CI/CD**: GitHub Actions with zero-downtime Azure App Service slot swap

## Architecture

### Security Layers (Request Flow)
```
Client -> CORS -> Rate Limiter -> Request Validator -> JWT Auth -> Audit Logger -> Router
```

### Backend Structure
```
backend/
├── server.py
├── middleware/ (auth, rate_limiter, request_validator, audit)
├── services/ (rag_engine, document_parser, pii_masker)
├── routers/ (health, query, documents, knowledge_base, rfp_response, stats, drafts, integrations, team_templates)
├── models/ (schemas.py)
└── tests/ (test_platform_apis.py, test_phase2_apis.py, test_team_templates_api.py)
```

### Frontend Structure
```
frontend/src/
├── pages/platform/ (HomePage, AgentsPage, WorkflowsPage, KnowledgeBasePage, MeetingsPage, ResponsePage)
├── components/platform/ 
│   ├── PlatformLayout.tsx (unified sidebar)
│   ├── knowledge-base/ (FolderExplorer, FileUploadZone, IntegrationsModal)
│   ├── ai-chat/ (ContextualChat)
│   └── response-wizard/ (ResponseWizard, DraftPresence, DraftList, SaveAsTemplateDialog, TemplateLibrary)
├── components/ui/ (Shadcn components)
└── hooks/ (useAuth, useProjects, useToast)
```

### API Endpoints Summary
| Category | Endpoints | Auth |
|----------|-----------|------|
| Health | GET /api/health | Public |
| RFP Templates | GET /api/rfp-response/templates | Public |
| KB Folders | CRUD /api/kb/folders | JWT |
| KB Documents | Upload/Delete /api/kb/folders/{id}/upload, /api/kb/documents/{id} | JWT |
| Stats | GET /api/stats | JWT |
| Drafts | CRUD + Presence + Versions /api/drafts/* | JWT |
| RFP Draft | POST /api/rfp-response/draft, /api/rfp-response/chat | JWT |
| Integrations | CRUD /api/integrations/* | JWT |
| Team Templates | CRUD + Use + Categories /api/team-templates/* | JWT |

## Completed Phases

### Phase 1: Enterprise Refactor & Security (COMPLETE)
- Modular backend, security middleware stack, removed hardcoded secrets, CI/CD

### Phase 2: UX Overhaul & Async RAG (COMPLETE)
- Enterprise design system, TanStack Query, ErrorBoundary, WCAG 2.1 AA

### Phase 3: Platform Features & UI Refinements (COMPLETE - Feb 2026)
- Unified sidebar, KB folder CRUD, AI Chat, RFP Wizard, 6 aviation templates, data-testids

### Phase 4: Collaboration, Stats & Integrations (COMPLETE - Feb 2026)
- Live stat cards, collaborative drafts (auto-save, presence, versioning)
- External integrations UI (SharePoint, OneDrive, Google Docs stubs)

### Phase 5: Team Templates with Sharing (COMPLETE - Feb 2026)
- **Team Templates CRUD**: Create, read, update, delete shared templates
- **Save as Template dialog**: Title, description, 9 categories, tags, shared/personal toggle
- **Template Library** (Step 4 in wizard): Searchable grid with category filters, usage counts, author info
- **Use Template**: One-click creates a new draft pre-filled from the template, increments usage count
- **Organization sharing**: Templates visible to all org members when shared
- **4-step wizard**: Search & Context → Draft & Edit → Saved Drafts → Team Templates
- All 17 backend tests + all frontend tests passed

## Pending / Backlog

### P1 - Upcoming
- Wire Azure OpenAI RAG end-to-end for KB chat and RFP draft (endpoints exist, need Azure config verification)
- Implement real OAuth for SharePoint/OneDrive/Google Docs (requires provider API keys)

### P2 - Future
- Full Playwright E2E test suite for authenticated flows
- WebSocket presence for real-time cursor sync
- Draft commenting / annotation
- Email notifications for draft changes / template updates

## MOCKED Features
- Integration connect/sync endpoints simulate OAuth success and return mock files
- RAG endpoints fall back to error messages if Azure OpenAI is unavailable

## 3rd Party Integrations
- Azure OpenAI (GPT-4o + text-embedding-ada-002) - User API Key
- Pinecone Serverless - User API Key
- Supabase (PostgreSQL, Auth) - User API Key
- MongoDB - Primary data store via motor
