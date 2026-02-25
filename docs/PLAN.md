# Avicon Feature Import Plan (AutoRFP)

## Objective
Import the best features from the `auto_rfp` project into our existing Avicon platform. Specifically:
1. **Option B (Project & Workspace Organization):** Segregate knowledge bases and RFPs into Organizations and Projects.
2. **Option A (Interactive Reasoning UI):** Expose the multi-step reasoning process (analyzing, searching, extracting) with source attribution, and allow the user to inline-edit the AI's drafted response.

---

## Architecture & Service Boundaries

### 1. Database & Schema (Agent: `database-architect`)
We need to expand the Supabase schema from a flat structure (using just `customer_id`) to a multi-tenant hierarchy.
*   **Tables:** 
    *   `organizations` (id, name, created_at)
    *   `projects` (id, org_id, name, description, created_at)
    *   Map users to organizations via edge function claims or a `user_org_roles` table.
*   **Vector Store impact:** Pinecone metadata must now filter on `project_id` rather than just `customer_id`. RLS (Row Level Security) policies must be updated to restrict data access.

### 2. Backend Service Updates (Agent: `backend-specialist` / `backend-security-coder`)
*   **FastAPI Update:** The `/query` endpoint currently returns a final answer. It must be refactored to **stream server-sent events (SSE)** so the frontend can receive "thought checkpoints" (e.g., `status: "Searching document Index"`, `status: "Extracting tables"`).
*   **Security:** Ensure that the Supabase Edge Proxy securely validates the user's `project_id` access against the new schema before forwarding requests to the Python vector engine.

### 3. Frontend UI Implementation (Agent: `frontend-specialist`)
*   **Workspace Navigation:** Create a new sidebar/header switcher that lets the user select their Organization and active Project.
*   **Interactive Chat Component:** 
    *   Upgrade `AIChatbot.tsx` to handle streamed SSE responses showing the reasoning trace.
    *   Provide inline editing capability (like an embedded Markdown editor) for the final response block so the user can tweak the RFP draft before exporting.

---

## Phase 2 Rollout Plan

Once this plan is approved, we will execute Phase 2 (Implementation) using parallel agents:

### Sequence
1.  **Foundation Group:** `database-architect` will deploy the Supabase schema updates and RLS policies. `security-auditor` will verify the access controls.
2.  **Core Group:**
    *   `backend-specialist` will update the Python FastAPI streaming logic.
    *   `frontend-specialist` will build the new Workspace Dashboard and the Interactive Reasoning UI.
3.  **Polish Group:** `test-engineer` will run E2E scenarios to verify a user can switch projects, upload a doc, see the reasoning trace, and edit the final output.

## Risks & Mitigations
*   **Risk:** Pinecone namespace/metadata conflicts during data migration.
    *   *Mitigation:* Introduce a rolling migration script; run the new schema in parallel until all docs are re-indexed with correct `project_id` tags.
*   **Risk:** Streaming complexity in Edge Functions.
    *   *Mitigation:* The Supabase Edge proxy must be carefully configured to pipe the SSE stream from Python directly to the React client without buffering.
