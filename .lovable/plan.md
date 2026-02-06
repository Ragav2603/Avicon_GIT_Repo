
Goal: Fix the “Create new RFP” AI extraction flow that consistently fails on PDF uploads, currently surfacing as either “Unexpected end of JSON input” or “Azure OpenAI returned an empty response body”.

What we know from repo + logs
- The failing path is the AI Extraction upload in `src/components/dashboard/SmartRFPCreator.tsx`, which:
  1) uploads a PDF to Storage (`user_uploads`)
  2) calls Edge Function `generate-draft` with `{ file_path, check_type: "rfp_extraction" }`
- `supabase/functions/generate-draft/index.ts` calls Azure OpenAI via `AZURE_OPENAI_ENDPOINT` and reads `aiResponse.text()`, returning a 502 if the body is empty.
- Supabase Edge Function logs show repeated crashes with `SyntaxError: Unexpected end of JSON input` coming from `ext:deno_fetch/...`, which strongly suggests that an older deployed version is still trying to do `await aiResponse.json()` (or a JSON body parse in the fetch layer), or we’re not actually running the latest deployed function build when the UI calls it.

Primary suspected root causes (ranked)
1) Deployed function version mismatch / stale deployment:
   - Logs indicate JSON parsing inside the fetch/json consumer layer (typical of `response.json()`), while the current code is using `response.text()` + `JSON.parse`.
   - If the deployed function didn’t update (or rolled back), the UI would still trigger the old crash.
2) Azure occasionally returning a 200 with an empty body (rare but possible with upstream connection termination / proxy issues), and we currently don’t capture enough diagnostics (headers, request id) to know why.
3) The client is using raw `fetch("https://.../functions/v1/generate-draft")` instead of `supabase.functions.invoke("generate-draft")`, so we have less consistent error handling and observability. This is not necessarily the cause, but switching improves reliability and debuggability.

Implementation plan (code changes)
A) Confirm we’re running the current edge function build
1. Add a lightweight “version stamp” in `generate-draft`:
   - Define a constant like `const FUNCTION_VERSION = "2026-02-06.1"` and log it at the start of each request.
   - Include the version in every success/error JSON response under e.g. `{ version: FUNCTION_VERSION }`.
2. Re-deploy `generate-draft` and verify in logs that requests show the new version stamp.

B) Improve Azure-call diagnostics and resilience inside `generate-draft`
1. Log key response metadata from Azure:
   - `status`, `statusText`
   - selected headers: `content-type`, `content-length`, `x-ms-request-id`, `x-ms-region`, `apim-request-id` (if present)
2. If `aiText` is empty:
   - Attempt a single retry (small backoff like 250–500ms) with the exact same payload.
   - On second failure, return a 502 with a structured error that includes the Azure status + the request id header values (not the prompt text).
3. Add an AbortController timeout (e.g., 60–90 seconds) around the Azure fetch so hung upstream connections don’t yield ambiguous behavior.
4. Normalize Azure errors:
   - If Azure returns JSON error bodies (common), include `error.code` and `error.message` in our error response.
   - Keep current 429/402 handling, and add handling for common Azure statuses like 400/401/403/404/408/409/500/502/503.

C) Make the frontend call consistent (recommended)
Update `src/components/dashboard/SmartRFPCreator.tsx` to use:
- `supabase.functions.invoke("generate-draft", { body: {...} })`
Instead of direct fetch to the functions URL.
Benefits:
- Reduces CORS/URL issues
- Lets Supabase SDK handle auth automatically
- Gives us a consistent `{ data, error }` contract and better error detail propagation

D) Add user-visible error details (non-sensitive)
1. In `SmartRFPCreator`, when an error happens:
   - Show a friendlier toast
   - Provide a collapsible “Technical details” section (or include in console) showing:
     - HTTP status if available
     - `version` from function response
     - `x-ms-request-id` if returned
This will speed up future debugging without exposing document contents.

Testing plan (end-to-end)
1. In Preview:
   - Log in
   - Open “Create New RFP” → AI Extraction
   - Upload a small PDF (1–2 pages) and confirm it completes
2. Repeat with:
   - A larger PDF (to validate truncation and timeout behavior)
   - A “problem” PDF that previously failed
3. Validate failure mode:
   - Temporarily set an invalid `AZURE_OPENAI_ENDPOINT` (only if you’re comfortable) and confirm the UI shows a clear error + request id/version (then restore).
4. Check Supabase Edge logs for `generate-draft`:
   - Confirm version stamp appears
   - Confirm Azure response header logging appears
   - If it fails, capture `x-ms-request-id` to correlate in Azure logs.

Files we will change
- `supabase/functions/generate-draft/index.ts`
  - Add version stamp logging + return field
  - Add Azure timeout, retry-on-empty-body, richer diagnostics
- `src/components/dashboard/SmartRFPCreator.tsx`
  - Switch from raw fetch to `supabase.functions.invoke`
  - Improve client-side error rendering (include function version + request id if present)

Notes / guardrails
- We will not log or return the uploaded document text.
- We will only include Azure request IDs and status metadata in errors to keep compliance/privacy.
- If the Azure endpoint is correct (as you indicated), the request-id logging will still help identify whether the empty-body issue is upstream (Azure/APIM) versus downstream (edge runtime deployment mismatch).

Acceptance criteria
- Creating an RFP via PDF upload succeeds reliably.
- If Azure fails, the UI shows a clear error message and the response includes:
  - function `version`
  - Azure request id header (when available)
- Edge logs clearly show which version is running and what Azure returned (status + request-id), enabling fast diagnosis.

