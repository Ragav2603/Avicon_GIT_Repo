
Goal: stop the Knowledge Base upload 500 and verify credentials end-to-end (Supabase edge function + Azure backend).

What I found
- The 403 for `Satoshi-Variable.woff2` is unrelated to document upload (font CDN issue only).
- Upload request now correctly goes to Supabase Edge Function:
  `POST /functions/v1/ai-proxy/upload`
- Edge logs show this sequence:
  - `AUDIT: Forwarding Upload | user=...`
  - then ~63 seconds later `Completed | status=500`
- This means:
  - frontend auth/session is working,
  - edge function is being reached,
  - request is being forwarded to backend,
  - failure happens inside the Azure backend processing stage.
- Azure backend `/health` is reachable and returns OK.
- Current project secrets visible in Lovable:
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_ENDPOINT`
  - `RESEND_API_KEY`
  - (plus Lovable internal key)
- I do not see a backend URL secret listed in Lovable secrets, but since forwarding happens, backend URL is currently set in runtime somewhere.
- Deployed Azure backend OpenAPI expects `customer_id` (not `project_id`) for `/upload` and `/query`, so the current ai-proxy payload shape is compatible.

Most likely root cause
- External Azure backend dependency/config issue during ingestion (not Supabase auth):
  - likely one of: `LLAMA_CLOUD_API_KEY`, `PINECONE_API_KEY`, Pinecone index config, or Azure embedding/deployment config on Azure App Service.
- The ~63s delay strongly suggests downstream processing timeout/failure rather than immediate validation/auth failure.

Implementation plan (once approved)
1) Improve error observability immediately (so failures become actionable)
- Update `supabase/functions/ai-proxy/index.ts` to:
  - always capture backend response body on non-2xx,
  - return normalized error JSON to client with:
    - backend status
    - backend `detail`/message
    - `request_id`
  - log the first safe slice of backend error body with request id.
- This turns current generic `Upload failed (500)` into specific root-cause messages.

2) Harden frontend function invocation and headers
- Update `frontend/src/components/Chat/AIChatbot.tsx` upload call to include both:
  - `Authorization`
  - `apikey`
- Keep routing through `ai-proxy`.
- Improve frontend error text extraction to read:
  - `error`, `detail`, and nested backend message fields.
- Result: clearer user-facing error and fewer false “credential missing” guesses.

3) Add lightweight connectivity/credential precheck path in ai-proxy
- Add optional ai-proxy diagnostic endpoint (safe, non-secret) that:
  - verifies backend base URL availability,
  - pings backend `/health`,
  - returns pass/fail + request id.
- This gives a quick “is bridge healthy?” check before upload.

4) Verify external Azure backend credentials (actual likely blocker)
- Since this backend is external to Supabase, validate in Azure App Service settings:
  - `LLAMA_CLOUD_API_KEY`
  - `PINECONE_API_KEY`
  - `PINECONE_INDEX_NAME`
  - `AZURE_OPENAI_API_KEY`
  - `AZURE_OPENAI_ENDPOINT`
  - embedding/chat deployment variables used by backend code
- If missing/invalid, set and restart Azure app.
- (I can’t set Azure App Service env vars from this project directly.)

5) End-to-end validation
- Re-test upload with a tiny `.txt` file first (fastest signal).
- Confirm:
  - edge logs show 200 (or clear non-200 reason),
  - UI shows success message,
  - follow-up query returns source snippets from uploaded file.
- Then test a realistic PDF/DOCX.

Technical notes for the code changes
- Files to update:
  - `supabase/functions/ai-proxy/index.ts`
  - `frontend/src/components/Chat/AIChatbot.tsx`
- No DB migration is required for this fix.
- Keep `verify_jwt = false` in `supabase/config.toml` and continue manual JWT verification in function code (current pattern is correct).

Expected outcome
- You’ll stop getting opaque `Upload failed (500)` and instead see exact backend failure reasons.
- If Azure credentials are the issue, the message will point directly to which dependency failed so it can be fixed quickly.
- Upload flow becomes reliable and debuggable.
