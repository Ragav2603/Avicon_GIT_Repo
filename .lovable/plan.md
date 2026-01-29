
# Company Email Validation for Signup

## Overview
Add validation to the signup form that only allows company/business email addresses, blocking common personal email providers like Gmail, Yahoo, Outlook, and others.

## What This Solves
Currently, anyone can sign up with any email address (personal or business). For a B2B aviation platform like AviCon, you want to ensure users represent legitimate companies, not individuals using personal accounts.

## Implementation Approach

### 1. Create a Custom Zod Validator for Company Emails

Add a reusable validation function that:
- Checks if the email is valid format
- Extracts the domain from the email
- Compares against a blocklist of personal email providers
- Returns a clear error message if blocked

**Blocked domains will include:**
- Gmail, Yahoo, Hotmail, Outlook, AOL
- iCloud, ProtonMail, Mail.com
- Live, MSN, Yandex, Zoho
- And other common free email providers

### 2. Update Auth.tsx Validation Schema

Modify the existing `authSchema` to use a custom Zod refinement that:
- Only applies the company email check during **signup mode** (not login or forgot password)
- Shows a user-friendly error message: "Please use your company email address"

### 3. File Changes

**`src/pages/Auth.tsx`**
- Add a constant array of blocked personal email domains
- Create a helper function `isCompanyEmail(email)` that returns true/false
- Update the Zod schema with a `.refine()` check for company emails
- Apply validation only during signup (login allows any email for existing users)

## Technical Details

```text
Blocked Domains List (~30 common providers):
gmail.com, yahoo.com, hotmail.com, outlook.com, aol.com,
icloud.com, protonmail.com, mail.com, live.com, msn.com,
yandex.com, zoho.com, gmx.com, fastmail.com, tutanota.com,
mailinator.com, guerrillamail.com, tempmail.com, and more
```

## User Experience
- When a user tries to sign up with a personal email (e.g., john@gmail.com)
- They see an error message: "Please use your company email address"
- Login is not affected (existing users with any email can still sign in)
- Password reset is not affected

## Security Notes
- This is client-side validation only (for UX improvement)
- For strict enforcement, server-side validation in the Supabase `handle_new_user` trigger or an edge function would be needed
- The current approach provides a good balance of UX and enforcement for honest users
