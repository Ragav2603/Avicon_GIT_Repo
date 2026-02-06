## 2026-02-06 - Hardcoded Supabase Secrets
**Vulnerability:** Hardcoded `SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_URL` in `src/integrations/supabase/client.ts`.
**Learning:** Even "generated" files can contain security vulnerabilities if the generation process or template includes hardcoded values. Developers might overlook these files assuming they are safe or untouchable.
**Prevention:** Always verify generated files for secrets. Use `import.meta.env` (or equivalent) in templates or during the generation process to reference environment variables instead of embedding values.
