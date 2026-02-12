## 2024-05-22 - [Insecure Authentication Pattern in Edge Functions]
**Vulnerability:** Several edge functions (`notify-submission-response`, `send-welcome-email`, `notify-proposal-submitted`, `notify-consulting-request`) were using `supabase.auth.getClaims(token)` to validate user authentication.
**Learning:** `getClaims()` only decodes the JWT without verifying if the user still exists or is banned in the database. This allows revoked users to potentially access authorized endpoints as long as their token hasn't expired.
**Prevention:** Always use `supabase.auth.getUser(token)` which validates the token against the Supabase Auth server and ensures the user is active.
