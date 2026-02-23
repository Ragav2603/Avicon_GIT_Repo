## 2026-02-06 - Hardcoded Supabase Secrets
**Vulnerability:** Hardcoded `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_URL` in `src/integrations/supabase/client.ts`.
**Learning:** Even "generated" files can contain security vulnerabilities if the generation process or template includes hardcoded values. Developers might overlook these files assuming they are safe or untouchable.
**Prevention:** Always verify generated files for secrets. Use `import.meta.env` (or equivalent) in templates or during the generation process to reference environment variables instead of embedding values.
## 2025-05-15 - Trusting User Input in Notification Emails
**Vulnerability:** The `notify-proposal-submitted` edge function accepted `vendor_name` and `rfp_title` from the request body and used them directly in email notifications. This allowed authenticated users to send misleading emails with arbitrary content (e.g., spoofing a submission from a major company).
**Learning:** Even authenticated endpoints can be vulnerable if they trust user-supplied metadata instead of fetching the source of truth from the database. This is a common pattern when migrating frontend logic (where data is available) to backend/edge functions.
**Prevention:** Always derive critical notification content (names, titles, statuses) from the database using trusted identifiers (like IDs from JWT or verified ownership checks), rather than accepting them from the client request.
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
## 2026-02-17 - Malformed Security Logic in Edge Function
**Vulnerability:** The `evaluate-adoption` Edge Function contained a corrupted code block with syntax errors and duplicated/conflicting validation logic, likely due to a bad merge of previous security fixes. This left the function in a broken state where security controls might not have been applied correctly.
**Learning:** Security fixes must be carefully merged and verified. A "fix" that breaks syntax or introduces logic errors can be worse than the original vulnerability if it creates a false sense of security or causes availability issues.
**Prevention:** Always run linting and tests after resolving merge conflicts or applying patches. Verify the final file content manually if automated tools are not fully integrated for the specific environment (like Deno edge functions in a Node repo).

## 2026-05-22 - Decentralized & Weak Password Validation
**Vulnerability:** Password validation logic was duplicated across components and only checked for minimum length, allowing weak passwords (e.g., "password123").
**Learning:** Hardcoded, inline validation in UI components leads to inconsistency and makes it difficult to enforce stronger security policies globally.
**Prevention:** Centralize all authentication-related validation (email, password complexity) into a shared library (e.g., `src/lib/auth-validation.ts`) using a schema builder like Zod. This ensures consistent enforcement and easier updates to security policies.
## 2024-05-22 - [Prompt Injection Mitigation in Edge Functions]
**Vulnerability:** The `evaluate-adoption` edge function's `sanitizeInput` allowed `<` and `>` characters, potentially enabling XML injection into the `<data>` block used in the LLM prompt.
**Learning:** Even with Zod validation, prompt construction logic must explicitly sanitize or escape characters used in the prompt structure (like XML tags) to prevent injection.
**Prevention:** Update sanitization functions to strip or escape `<` and `>` when using XML-structured prompts.

## 2026-02-18 - BOLA Vulnerability in File Processing
**Vulnerability:** The `generate-draft` Edge Function accepted a `file_path` parameter and used the Service Role key to download the file, bypassing RLS. It did not validate that the `file_path` belonged to the authenticated user, allowing any user to process any file in the `user_uploads` bucket.
**Learning:** Using the Service Role key in Edge Functions effectively disables Row Level Security. Explicit ownership checks are mandatory when handling resources identified by user input (like file paths or IDs), especially when `verify_jwt` is disabled or when using privileged clients.
**Prevention:** Always validate that the resource ID (e.g., file path) matches the authenticated user's scope (e.g., starts with `${user.id}/`). Prefer using a Supabase client initialized with the user's Auth token (`Authorization` header) to naturally enforce RLS policies.

## 2026-02-18 - Prompt Injection via XML Injection in Edge Functions
**Vulnerability:** The `analyze-proposal` Edge Function constructed an XML prompt for an LLM using user input (`rfpTitle`) without escaping XML characters `<` and `>`. This allowed users to inject arbitrary XML tags, potentially confusing the LLM or overriding instructions.
**Learning:** When using XML tags to structure LLM prompts, simple sanitization (e.g., removing backticks) is insufficient. Attackers can close the data tags and inject new instructions.
**Prevention:** Always escape XML characters (`<` to `&lt;`, `>` to `&gt;`) in user input before embedding it into XML-structured prompts.
