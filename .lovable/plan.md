
## Fix: Edge Function Deployment, AI Import Classification, and Project Publishing

### Issues Identified

**1. "Edge Function returned a non-2xx status code" on project publishing**
The `create-project` edge function expects a `due_date` field as an ISO datetime string (validated by `z.string().datetime()`). If the date is omitted or sent as `undefined`, it passes validation. However, the `supabase.functions.invoke` call may fail if the user's auth token is stale or if there's a network-level issue. The function needs better error logging to diagnose this.

**2. Git deployment 409 Conflict**
This is an Azure App Service issue unrelated to Lovable. The `avicon-fastapi-backend` deployment conflicts when a previous deployment is still in progress. This cannot be fixed from Lovable -- it requires retrying the GitHub Actions workflow or restarting the Azure App Service slot. No code changes needed here.

**3. All AI extractions go to Deal Breakers**
The `generate-draft` edge function maps `is_mandatory: q.is_mandatory ?? false`. The `??` operator only catches `null`/`undefined`, NOT `false`. If the AI worker explicitly returns `is_mandatory: true` on most items (which appears to be the case based on the 8/10 and 10/10 question counts in logs), items will correctly be marked mandatory. The fix must be more assertive: **default ALL extracted items to non-mandatory (Requirements)** regardless of what the AI worker returns. Users can then manually drag items to Deal Breakers.

---

### Changes

**A. `supabase/functions/generate-draft/index.ts`**
- Force `is_mandatory` to `false` for ALL extracted items, ignoring the AI worker's classification entirely:
  - Line 112: Change `is_mandatory: q.is_mandatory ?? false` to `is_mandatory: false`
  - Line 122: Change `mandatory: q.is_mandatory ?? false` to `mandatory: false`
- This ensures every AI-extracted item lands in the Requirements column. Users reclassify manually.
- Update the version stamp to confirm redeployment.

**B. `supabase/functions/create-project/index.ts`**
- Add `console.log` statements for request handling to make debugging easier:
  - Log the parsed body after validation
  - Log the user ID
  - Log any project creation errors in detail
- Change the `due_date` validation from `z.string().datetime().optional().nullable()` to `z.string().optional().nullable()` to be more lenient with date formats (some browsers may send date-only strings).

**C. `src/components/rfp/CreateProjectWizard.tsx`**
- In the prefill data handler (lines 93-104), add a safety net: force `is_mandatory` to `false` on all incoming requirements so even if the edge function sends `true`, the frontend always defaults to Requirements:
  ```
  const isMandatory = false; // Always default to Requirements
  ```

**D. Redeploy edge functions**
- Both `generate-draft` and `create-project` must be redeployed after changes.

---

### Technical Details

```text
Root cause of deal-breaker misclassification:
  AI Worker returns is_mandatory: true on most items
  Edge function: q.is_mandatory ?? false -- the ?? only catches null/undefined
  Since is_mandatory is explicitly true, it passes through unchanged
  
Fix approach:
  Hardcode is_mandatory = false in both edge function AND frontend
  Users manually promote items to Deal Breakers via drag-and-drop
```

The Azure 409 Conflict is outside Lovable's control -- it's a deployment slot conflict on Azure App Service. The user should retry the GitHub Actions workflow after waiting a few minutes.
