## 2024-05-24 - [Unrestricted File Upload Vulnerability]
**Vulnerability:** The document upload endpoint (`/upload`) accepted any file type (including executables) and had no file size limits, exposing the system to RCE and DoS attacks.
**Learning:** Backend endpoints often default to permissive acceptance. Explicit validation layers (whitelist extensions, size limits) must be the first line of defense before any processing logic.
**Prevention:** Always implement a "deny by default" policy for file uploads. Use a strict whitelist of allowed MIME types/extensions and enforce file size limits at the application (and infrastructure) level.

## 2024-05-27 - [Exposed Service Role Key]
**Vulnerability:** The backend environment file (`backend/.env`) containing the Supabase Service Role Key was tracked in git, exposing full database access privileges.
**Learning:** `git rm --cached` is required to untrack files that were previously committed, even if they are later added to `.gitignore`. `.gitignore` only prevents *new* files from being added.
**Prevention:** Verify `.env` files are ignored *before* first commit. Use pre-commit hooks (like `git-secrets` or `trufflehog`) to scan for high-entropy strings or known key patterns before allowing commits.
