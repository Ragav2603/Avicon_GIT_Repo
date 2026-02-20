
# Fix Non-Functional Action Links on Adoption Audits Page

## Problem
The "View alternatives", "Schedule now", and "Schedule review" links in the AI Recommendations section are rendered as buttons with no click handler, so nothing happens when users click them.

## Solution
Add toast notifications as feedback when these action links are clicked. Since this is mock/demo data with no real backend endpoints for these actions yet, a toast message is the appropriate response -- it acknowledges the click and informs the user.

## Technical Details

### File: `src/pages/airline/AdoptionTrackerPage.tsx`

1. Import `useToast` from `@/hooks/use-toast`
2. Add `const { toast } = useToast()` inside the component
3. Add an `onClick` handler to the action `Button` that shows a relevant toast message:
   - "View alternatives" -> Toast: "This feature is coming soon. You'll be able to browse alternative tools."
   - "Schedule now" -> Toast: "This feature is coming soon. You'll be able to schedule training sessions."
   - "Schedule review" -> Toast: "This feature is coming soon. You'll be able to schedule adoption reviews."

The handler will use the `rec.action` string to determine the toast content, keeping it simple and data-driven.

### No new files or dependencies needed.
