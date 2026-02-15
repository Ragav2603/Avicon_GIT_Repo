## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-08 - Missing Input Validation in Edge Function

**Vulnerability:** The `evaluate-adoption` Edge Function accepted JSON bodies without validation, risking injection and DoS.
**Learning:** Edge Functions are public endpoints and must validate all inputs before processing or using them in database/AI operations.
**Prevention:** Implement strict Zod schema validation for all request bodies, including type checks, length limits, and sanitization for injection vectors.
