## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-13 - Supabase Profile ID Mismatch

**Vulnerability:** Vendor profiles created via magic links used random UUIDs, causing a mismatch with `auth.users.id`. This breaks RLS policies relying on `auth.uid() = profiles.id`.
**Learning:** When provisioning users via backend functions, always create the Auth User first and use its ID for the `public.profiles` table.
**Prevention:** Use `supabase.auth.admin.createUser()` to generate the user and ID before inserting into `profiles`.
## 2026-02-08 - Prompt Injection in Edge Functions

**Vulnerability:** The `evaluate-adoption` Edge Function accepted raw user input (`tool_name`) and inserted it directly into an LLM prompt without sanitization.
**Learning:** LLM integrations are vulnerable to Prompt Injection where users can override system instructions. Zod validation is crucial but insufficient alone; specific sanitization (regex) of prompt inputs is required.
**Prevention:** Strictly validate input length and character sets (e.g., alphanumeric only) for fields used in prompts. Trim whitespace and control characters.
## 2026-02-15 - Committed Environment File

**Vulnerability:** Found `.env` file containing `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_PUBLISHABLE_KEY` committed to the git repository.
**Learning:** Committing environment files exposes sensitive configuration and secrets to version control history, making them accessible to anyone with repository access.
**Prevention:** Add `.env` and `.env.*` to `.gitignore` immediately upon project initialization. Use `.env.example` for template variables without values.
## 2026-02-15 - LLM Prompt Injection in Edge Functions
**Vulnerability:** Found direct interpolation of user input (`tool_name`) into an LLM prompt in `supabase/functions/evaluate-adoption/index.ts`.
**Learning:** Edge Functions interfacing with LLMs are vulnerable to injection attacks if user input is not strictly sanitized.
**Prevention:** Sanitize all user input before using it in prompts. Remove control characters, limit length, and strip potential delimiters like braces and backticks.
## 2026-02-08 - Missing Input Validation in Edge Function

**Vulnerability:** The `evaluate-adoption` Edge Function accepted JSON bodies without validation, risking injection and DoS.
**Learning:** Edge Functions are public endpoints and must validate all inputs before processing or using them in database/AI operations.
**Prevention:** Implement strict Zod schema validation for all request bodies, including type checks, length limits, and sanitization for injection vectors.
## 2026-02-15 - PII Logging in Edge Functions

**Vulnerability:** The `send-welcome-email` function was logging the user's email address (`userEmail`) to the console, exposing sensitive PII.
**Learning:** Logging entire user objects or sensitive fields like email addresses creates privacy risks and potential data leaks in server logs.
**Prevention:** Avoid logging sensitive data. Use opaque identifiers (e.g., `userId`, `rfpId`) for tracing and debugging. Review all `console.log` statements during code reviews.
## 2026-02-15 - Prototype Pollution in CSV Processing

**Vulnerability:** `supabase/functions/process-adoption-csv/index.ts` used a plain JavaScript object to aggregate metrics, where keys were derived from user-provided CSV content (`tool_name`).
**Learning:** Keys like `__proto__` or `constructor` can pollute the prototype or cause crashes (DoS) when used as keys in plain objects.
**Prevention:** Use `Map` instead of plain objects (`{}`) when keys are user-controlled or untrusted. `Map` keys are safe and do not interact with the prototype chain.
