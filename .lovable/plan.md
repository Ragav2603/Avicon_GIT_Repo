

# Fix: Recreate Missing `.env` File

## Problem
The `.env` file has been deleted, so `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are undefined at runtime, causing the app to crash with "Missing Supabase environment variables" on every page.

## Solution
Recreate the `.env` file with the correct Supabase credentials (already known from the project configuration):

```
VITE_SUPABASE_PROJECT_ID="aavlayzfaafuwquhhbcx"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhdmxheXpmYWFmdXdxdWhoYmN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NDMyNTcsImV4cCI6MjA4NDIxOTI1N30.gst2u0jgQmlewK8FaQFNlVI_q4_CvFJTYytuiLbR55k"
VITE_SUPABASE_URL="https://aavlayzfaafuwquhhbcx.supabase.co"
```

## Files to Create
- `.env` (single file, 3 lines)

No other code changes are needed -- the `client.ts` file is correct.

