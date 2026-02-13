## 2026-02-08 - Hardcoded Supabase Secrets

**Vulnerability:** Found hardcoded `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in `src/integrations/supabase/client.ts`.
**Learning:** Generated code or templates sometimes include secrets directly, which is a major security risk.
**Prevention:** Always use environment variables (`import.meta.env` in Vite) for configuration, especially for keys and URLs.

## 2026-02-13 - Supabase Profile ID Mismatch

**Vulnerability:** Vendor profiles created via magic links used random UUIDs, causing a mismatch with `auth.users.id`. This breaks RLS policies relying on `auth.uid() = profiles.id`.
**Learning:** When provisioning users via backend functions, always create the Auth User first and use its ID for the `public.profiles` table.
**Prevention:** Use `supabase.auth.admin.createUser()` to generate the user and ID before inserting into `profiles`.
