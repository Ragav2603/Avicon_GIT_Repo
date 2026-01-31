# AviCon Implementation Plan

## Overview
This plan outlines the phased implementation of the AviCon platform based on the requirements specification. The platform serves Airlines (buyers) and Vendors (sellers) with AI-powered RFP generation and proposal management.

---

## Phase 1: Foundation & Authentication (Current Sprint)
**Goal:** Establish core infrastructure and user management

### 1.1 Admin Approval Workflow ✅ Partially Complete
- [x] Admin dashboard at `/admin`
- [x] Invite code generation and management
- [x] Approved email domains for auto-role assignment
- [ ] **NEW:** Signup request temp table for pending approvals
- [ ] **NEW:** Admin UI to approve/reject pending signups
- [ ] **NEW:** Email notification on approval/rejection

### 1.2 User Grouping by Company
- [ ] Add `company_id` to profiles table
- [ ] Create `companies` table (id, name, domain, type: airline/vendor)
- [ ] Auto-detect company from email domain on signup
- [ ] Company-level settings and branding

### 1.3 Task Assignment System
- [ ] Create `tasks` table (id, rfp_id, assignee_id, assigner_id, title, description, status, due_date)
- [ ] Task assignment UI in RFP/Proposal views
- [ ] Email notifications via edge function

---

## Phase 2: Document Processing & AI Agents
**Goal:** Enable AI-powered document analysis and generation

### 2.1 Document Upload Infrastructure
- [ ] Create `documents` storage bucket
- [ ] Document metadata table (id, user_id, filename, type, parsed_content, created_at)
- [ ] Support for PDF, DOC, DOCX, XLSX formats
- [ ] File size limits and validation

### 2.2 Document Analyzer (AI)
- [ ] Edge function: `analyze-document`
  - Parse uploaded documents
  - Extract entities (Organizations, Dates, Locations, Keywords)
  - Identify sections and structure
  - Generate document summary
- [ ] UI: Upload flow with progress indicators
- [ ] UI: Extracted data display (sections, entities, summary)

### 2.3 AI Analysis Agent (Airlines)
- [ ] Edge function: `generate-rfp-draft`
  - Input: Previous RFP documents
  - Extract key segments and requirements
  - Generate structured RFP draft
- [ ] Online editor with:
  - Rich text editing
  - Spell check integration
  - Copy/paste from external docs
  - Section management

### 2.4 AI Proposal Agent (Vendors)
- [ ] Edge function: `generate-proposal-draft`
  - Input: RFP + Previous proposals
  - Match segments from RFP to proposal content
  - Highlight compliance status per section
  - Generate match scores
- [ ] Gap analysis view showing:
  - Requirement vs Response comparison
  - Compliance status (Compliant/Partial/Non-compliant)
  - Section-level scores
  - Editor + Reviewer assignment

---

## Phase 3: AI Text Helper Tools
**Goal:** Provide AI-assisted text editing capabilities

### 3.1 Text Transformation Tools
- [ ] Edge function: `ai-text-helper`
  - **Shorten:** Make response more concise
  - **Spelling & Grammar:** Fix issues
  - **Simplify:** Simplify language
  - **Improve Flow:** Enhance readability
  - **Rewrite:** Generate new version from context
  - **Professional:** Add professional tone
  - **Generic Answer:** Generate non-specific response

### 3.2 Inline Editor Integration
- [ ] Floating toolbar in text editors
- [ ] Selection-based transformations
- [ ] Before/after comparison view
- [ ] Accept/reject changes

---

## Phase 4: Vendor Dashboard & Proposal Builder
**Goal:** Complete vendor experience

### 4.1 Vendor Dashboard Layout ✅ Basic exists
- [ ] Sidebar: Overview, Open RFPs, My Proposals, Deadlines
- [ ] Stats: Proposals submitted, Win rate, Avg score
- [ ] Recent activity feed

### 4.2 Proposal Builder
- [ ] Two-path creation (like Airline RFP):
  - **AI Extraction:** Upload previous proposals → auto-fill
  - **Manual Builder:** Start from scratch
- [ ] Section-by-section response editor
- [ ] Real-time compliance scoring
- [ ] Go/No-Go indicator display (Green/Yellow/Red)

### 4.3 Deadline Management
- [ ] Countdown clock component (prominent display)
- [ ] Deadline warnings (7 days, 3 days, 1 day, overdue)
- [ ] Email reminders via scheduled edge function

### 4.4 Deal Breaker Indicators
- [ ] Visual status per requirement:
  - 🟢 Green: Fully compliant
  - 🟡 Yellow: Partially compliant
  - 🔴 Red: Non-compliant / Deal breaker
- [ ] Filter by compliance status
- [ ] Focus mode for critical items

---

## Phase 5: Scoring & Evaluation System
**Goal:** Enable structured vendor evaluation

### 5.1 Scorecard Management (Airlines)
- [ ] Create `scorecards` table (id, rfp_id, name, criteria JSON)
- [ ] Manual scorecard builder UI:
  - Add criteria with weights (percentage)
  - Set max scores and priorities
  - Assign evaluators
- [ ] Pre-built scorecard templates

### 5.2 Evaluation Workflow
- [ ] Multi-evaluator support
- [ ] Score aggregation (weighted average)
- [ ] Consensus view for disagreements
- [ ] Final score calculation

### 5.3 Go/No-Go Decision Support
- [ ] Decision matrix visualization
- [ ] Automated recommendations based on scores
- [ ] Export evaluation report

---

## Phase 6: Dashboard & Analytics
**Goal:** Comprehensive visibility into RFP/Proposal lifecycle

### 6.1 Airline Dashboard Enhancements
- [ ] RFP stages timeline: Draft → In-Progress → Completed → Archived
- [ ] Submission metrics per RFP
- [ ] AI draft rate statistics
- [ ] Vendor comparison charts

### 6.2 Vendor Dashboard Enhancements
- [ ] Proposal stages timeline: Draft → In-Progress → Completed → Archived
- [ ] Overall progress indicator (X of Y responses approved)
- [ ] Compliance breakdown chart
- [ ] Win/loss analytics

### 6.3 Project Management View
- [ ] Kanban board for task tracking
- [ ] Team workload distribution
- [ ] Due date calendar view

---

## Phase 7: Collaboration Features
**Goal:** Enable team collaboration

### 7.1 Built-in Comments
- [ ] Threaded comments on sections
- [ ] @mentions for team members
- [ ] Comment resolution workflow

### 7.2 External Integrations (Future)
- [ ] Google Drive picker
- [ ] Dropbox integration
- [ ] OneDrive integration
- [ ] Box integration

### 7.3 Real-time Collaboration
- [ ] Presence indicators (who's viewing)
- [ ] Conflict resolution for simultaneous edits
- [ ] Activity feed

---

## Database Schema Additions

```sql
-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('airline', 'vendor')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Signup requests (pending approval)
CREATE TABLE signup_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  company_domain TEXT,
  requested_role TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES rfps,
  submission_id UUID REFERENCES submissions,
  title TEXT NOT NULL,
  description TEXT,
  assignee_id UUID REFERENCES auth.users NOT NULL,
  assigner_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  company_id UUID REFERENCES companies,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  parsed_content JSONB,
  extracted_entities JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Scorecards
CREATE TABLE scorecards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfp_id UUID REFERENCES rfps NOT NULL,
  name TEXT NOT NULL,
  criteria JSONB NOT NULL,
  created_by UUID REFERENCES auth.users,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scorecard_id UUID REFERENCES scorecards NOT NULL,
  submission_id UUID REFERENCES submissions NOT NULL,
  evaluator_id UUID REFERENCES auth.users NOT NULL,
  scores JSONB NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Edge Functions Required

| Function Name | Purpose | Priority |
|--------------|---------|----------|
| `analyze-document` | Parse and extract entities from uploaded docs | High |
| `generate-rfp-draft` | AI-generate RFP from previous documents | High |
| `generate-proposal-draft` | AI-generate proposal from RFP + past proposals | High |
| `ai-text-helper` | Text transformation tools | Medium |
| `calculate-compliance-score` | Score vendor responses against requirements | High |
| `send-task-notification` | Email when task assigned | Medium |
| `send-deadline-reminder` | Scheduled deadline reminders | Medium |

---

## Recommended Implementation Order

### Sprint 1 (Current): Foundation ✅
1. ✅ Airline Dashboard with sidebar layout
2. ✅ Smart RFP Creator (AI extraction + manual)
3. ✅ Submission Review table with AI verification

### Sprint 2: Vendor Experience
1. Vendor Dashboard with sidebar layout
2. Proposal Builder (AI extraction + manual)
3. Deadline countdown component
4. Deal breaker indicators (Green/Yellow/Red)

### Sprint 3: AI Document Processing
1. Document upload infrastructure
2. Document Analyzer edge function
3. AI Analysis Agent (RFP generation)
4. AI Proposal Agent (proposal matching)

### Sprint 4: Text Helper & Scoring
1. AI Text Helper tools
2. Inline editor integration
3. Scorecard management
4. Evaluation workflow

### Sprint 5: Collaboration & Polish
1. Task assignment system
2. Comments and mentions
3. Dashboard analytics
4. Email notifications

---

## Success Metrics

- **Time to RFP Draft:** < 5 minutes (vs hours manually)
- **Proposal Match Accuracy:** > 85% segment matching
- **User Adoption:** 80% of RFPs use AI extraction
- **Compliance Detection:** 95% accuracy on deal breakers

---

*Last Updated: January 2026*
