## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-15 - LLM Prompt Injection in Edge Functions
**Vulnerability:** Found direct interpolation of user input (`tool_name`) into an LLM prompt in `supabase/functions/evaluate-adoption/index.ts`.
**Learning:** Edge Functions interfacing with LLMs are vulnerable to injection attacks if user input is not strictly sanitized.
**Prevention:** Sanitize all user input before using it in prompts. Remove control characters, limit length, and strip potential delimiters like braces and backticks.
