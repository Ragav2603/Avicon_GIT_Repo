## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-08 - Prompt Injection in Edge Functions

**Vulnerability:** The `evaluate-adoption` Edge Function accepted raw user input (`tool_name`) and inserted it directly into an LLM prompt without sanitization.
**Learning:** LLM integrations are vulnerable to Prompt Injection where users can override system instructions. Zod validation is crucial but insufficient alone; specific sanitization (regex) of prompt inputs is required.
**Prevention:** Strictly validate input length and character sets (e.g., alphanumeric only) for fields used in prompts. Trim whitespace and control characters.
