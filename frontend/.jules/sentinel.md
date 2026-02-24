## 2024-05-24 - [Unrestricted File Upload Vulnerability]
**Vulnerability:** The document upload endpoint (`/upload`) accepted any file type (including executables) and had no file size limits, exposing the system to RCE and DoS attacks.
**Learning:** Backend endpoints often default to permissive acceptance. Explicit validation layers (whitelist extensions, size limits) must be the first line of defense before any processing logic.
**Prevention:** Always implement a "deny by default" policy for file uploads. Use a strict whitelist of allowed MIME types/extensions and enforce file size limits at the application (and infrastructure) level.
