## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-15 - Committed Environment File

**Vulnerability:** Found `.env` file containing `VITE_SUPABASE_PROJECT_ID` and `VITE_SUPABASE_PUBLISHABLE_KEY` committed to the git repository.
**Learning:** Committing environment files exposes sensitive configuration and secrets to version control history, making them accessible to anyone with repository access.
**Prevention:** Add `.env` and `.env.*` to `.gitignore` immediately upon project initialization. Use `.env.example` for template variables without values.
