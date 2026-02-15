## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-08 - Insecure Edge Function Configuration

**Vulnerability:** Found `verify_jwt = false` configured for multiple authenticated Supabase Edge Functions in `supabase/config.toml`, allowing potential unauthorized access if manual verification is bypassed or flawed.
**Learning:** Relying solely on manual JWT verification within function logic is error-prone and less secure than platform-level enforcement.
**Prevention:** Configure `verify_jwt = true` in `supabase/config.toml` for all Edge Functions that require authentication, and ensure clients send the `Authorization` header.
