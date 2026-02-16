

# Frontend Integration: Wire Up "Request Projects" Backend

## Summary
The backend infrastructure (tables, types, API functions, hooks, edge function) for "Request Projects" is already built but the UI components are still talking to the old `rfps` table directly. This plan wires the existing frontend components to use the new `projects` backend.

## What Already Exists
- Database tables: `projects` and `project_templates`
- Types: `src/types/projects.ts`
- API layer: `src/lib/api/projects.ts` with all CRUD functions
- React Query hooks: `src/hooks/useProjects.ts`
- Edge function: `create-project` (deployed)
- Template selector already fetches from `project_templates` via the hook

## What Needs to Change

### 1. Refactor CreateProjectWizard to use the new API
The wizard currently inserts directly into the `rfps` table. It will be updated to:
- Use the `useCreateProject` hook from `useProjects.ts`
- Call `createProject()` which invokes the `create-project` edge function
- Map adoption goals and deal breakers into the `Requirement[]` format expected by the new schema
- On success, navigate to the new project or refresh the project list

### 2. Refactor MyRFPsPage to use the new hooks
The page currently fetches from `rfps` using raw Supabase queries. It will be updated to:
- Use `useUserProjects()` hook for fetching the project list
- Use `useUpdateProjectStatus()` hook for the withdraw action
- Map the `Project` type fields (title, status, due_date, created_at) to the existing card UI
- Remove the inline `fetchProjects` function and `useState` for projects/loading

### 3. Create project_submissions table (migration)
The guide references a `project_submissions` table for vendor proposals. A new migration will create this table with columns:
- `id`, `project_id` (FK to projects), `vendor_id`, `pitch_text`, `file_paths` (jsonb), `evaluation_status`, `score`, `summary`, `pros`, `cons`, `created_at`
- RLS policies: vendors can insert/read their own submissions, project owners can read all submissions for their projects

### 4. Add submission API functions
New functions in `src/lib/api/projects.ts`:
- `submitProposal(projectId, file, pitchText)` -- uploads file to storage, creates submission record
- `triggerVerification(submissionId)` -- calls the existing `verify-submission` edge function
- `getProjectSubmissions(projectId)` -- fetches submissions for a project

### 5. Add submission hooks
New hooks in `src/hooks/useProjects.ts`:
- `useSubmitProposal()` -- mutation hook for vendor submission
- `useProjectSubmissions(projectId)` -- query hook for fetching submissions

## Technical Details

### Requirement mapping (CreateProjectWizard)
```text
AdoptionGoal { text, enabled } --> Requirement { text, type: 'text', mandatory: false, weight: 2 }
DealBreaker { text, enabled } --> Requirement { text, type: 'boolean', mandatory: true, weight: 5 }
```

### MyRFPsPage data mapping
```text
Project.title        --> card title
Project.status       --> badge (draft/open/review/closed)
Project.due_date     --> deadline display
Project.created_at   --> created date
```
Note: `budget_max` and `description` do not exist on the `projects` table, so those fields will be removed from the card or added to the schema if needed.

### Migration SQL (project_submissions)
Creates the table with RLS enabled, policies for vendor insert/select and project-owner select.

## Files to Modify
- `src/components/rfp/CreateProjectWizard.tsx` -- use `useCreateProject` hook
- `src/pages/airline/MyRFPsPage.tsx` -- use `useUserProjects` and `useUpdateProjectStatus` hooks
- `src/lib/api/projects.ts` -- add submission functions
- `src/hooks/useProjects.ts` -- add submission hooks
- `src/types/projects.ts` -- add `ProjectSubmission` type

## New Files
- None (all changes fit into existing files)

## Database Migration
- Create `project_submissions` table with RLS policies

## Sequencing
1. Run migration for `project_submissions`
2. Update `CreateProjectWizard` to use new API
3. Update `MyRFPsPage` to use new hooks
4. Add submission types, API functions, and hooks

