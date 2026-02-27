# Avicon Enterprise Platform — PRD

## Overview
Multi-tenant RAG-powered procurement intelligence platform for the aviation industry.
SOC2/GDPR audit-ready with namespace-isolated AI capabilities.
Built with Lovable UI (preserved) + enterprise backend features.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, Uvicorn (ASGI), Motor (async MongoDB)
- **RAG Engine**: LangChain LCEL (async), Azure OpenAI (GPT-4o + text-embedding-ada-002), LlamaIndex
- **Vector DB**: Pinecone Serverless (namespace-based multi-tenancy)
- **Auth DB**: Supabase (PostgreSQL) with JWT-based auth
- **Frontend**: React 18, TypeScript, TanStack Query, Tailwind CSS, Shadcn/UI, Vite, Framer Motion, Lenis
- **CI/CD**: GitHub Actions with zero-downtime Azure App Service slot swap

## Frontend Architecture (Lovable UI + New Platform Features)

### Original Lovable Pages (preserved)
- `/` — Landing page with ClosedLoopHero, TrustedPartnersMarquee, SmartProcurementSection, AIDocumentIntel, DealBreakersSection, AdoptionROISection, AirplaneScroll, ScrollExperience, HowItWorksSection
- `/auth` — Split-layout authentication
- `/airline-dashboard` — Airline role dashboard with RFPs, projects, vendor matches, adoption tracker
- `/vendor-dashboard` — Vendor role dashboard with proposals, analytics
- `/consultant-dashboard` — Consultant dashboard with audits, clients, analytics
- `/admin` — Admin dashboard
- `/rfp/:id` — RFP details
- `/knowledge-base` — Standalone knowledge base
- `/respond/:token` — Vendor magic link response

### New Platform Pages (added by Emergent)
- `/platform` — Platform home with live stat cards
- `/platform/agents` — AI agents management
- `/platform/workflows` — Workflow automation
- `/platform/knowledge-base` — Enhanced KB with Explorer + AI Chat tabs
- `/platform/meetings` — Meeting scheduler
- `/platform/response` — 4-step RFP Response Wizard with team templates

## Backend Routers
```
routers/
├── health.py          — Health check (public)
├── query.py           — RAG query (JWT)
├── documents.py       — Document upload/embedding (JWT)
├── knowledge_base.py  — KB folders/documents CRUD (JWT)
├── rfp_response.py    — RFP templates + AI draft generation (mixed)
├── stats.py           — Platform stats dashboard (JWT)
├── drafts.py          — Collaborative drafts + presence + versioning (JWT)
├── integrations.py    — External provider connection stubs (JWT)
└── team_templates.py  — Team template library CRUD + use (JWT)
```

## Completed Features

### Phases 1-3 (Enterprise + UI)
- Enterprise security middleware (JWT, PII masking, rate limiting, audit)
- KB folder CRUD, document upload, AI chat
- 6 aviation RFP templates

### Phase 4 (Collaboration, Stats, Integrations)
- Live stat cards, collaborative drafts (auto-save, presence, versioning)
- External integrations UI (SharePoint, OneDrive, Google Docs stubs)

### Phase 5 (Team Templates)
- Team template library with CRUD, sharing, categories, tags, usage tracking
- Save as Template from draft editor, Use Template to pre-fill new drafts
- 4-step wizard: Search & Context → Draft & Edit → Saved Drafts → Team Templates

## MOCKED Features
- Integration connect/sync stubs (simulate OAuth, return mock files)
- RAG endpoints fall back to error if Azure OpenAI unavailable

## Pending / Backlog
- Wire Azure OpenAI RAG end-to-end for KB chat and RFP draft
- Real OAuth for SharePoint/OneDrive/Google Docs
- Full E2E test suite for authenticated flows
- WebSocket presence, draft commenting, email notifications
