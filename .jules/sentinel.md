## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-15 - PII Logging in Edge Functions

**Vulnerability:** The `send-welcome-email` function was logging the user's email address (`userEmail`) to the console, exposing sensitive PII.
**Learning:** Logging entire user objects or sensitive fields like email addresses creates privacy risks and potential data leaks in server logs.
**Prevention:** Avoid logging sensitive data. Use opaque identifiers (e.g., `userId`, `rfpId`) for tracing and debugging. Review all `console.log` statements during code reviews.
## 2026-02-15 - Prototype Pollution in CSV Processing

**Vulnerability:** `supabase/functions/process-adoption-csv/index.ts` used a plain JavaScript object to aggregate metrics, where keys were derived from user-provided CSV content (`tool_name`).
**Learning:** Keys like `__proto__` or `constructor` can pollute the prototype or cause crashes (DoS) when used as keys in plain objects.
**Prevention:** Use `Map` instead of plain objects (`{}`) when keys are user-controlled or untrusted. `Map` keys are safe and do not interact with the prototype chain.
