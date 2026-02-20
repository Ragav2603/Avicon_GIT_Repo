
# Final Audit: Remaining Hardcoded Color Classes

## Visual Verification
The landing page and its key sections (DealBreakersSection, GoNoGoSection, AdoptionROISection, etc.) render correctly with the new semantic tokens. Status badges show proper green/red/amber colors, and the compliance dashboard mockup looks clean.

## Audit Results

The search found **14 files** still containing hardcoded Tailwind color classes. Two are intentionally excluded:
- `src/components/ui/toast.tsx` -- shadcn base UI component (do not modify)
- `src/lib/__tests__/utils.test.ts` -- test fixture (uses color classes as test data)

That leaves **12 files** with hardcoded colors still to migrate:

### Dashboard / Page Files (3)

**1. `src/pages/AirlineDashboard.tsx`**
- `text-green-600` trend text, `bg-green-100 text-green-700` / `bg-amber-100 text-amber-700` status badges
- Replace with `text-success`, `bg-success/10 text-success`, `bg-warning/10 text-warning`

**2. `src/pages/vendor/VendorProposalsPage.tsx`** (partially missed)
- Detail panel progress bar: `bg-green-500` / `bg-yellow-500` and text `text-green-600` / `text-yellow-600`
- Replace with `bg-success` / `bg-warning` and `text-success` / `text-warning`

**3. `src/pages/Auth.tsx`**
- `text-sky-300` and `bg-sky-300` used for brand accent on login page
- These are intentional branding colors. **No change recommended** -- sky-300 is decorative branding, not a status color.

### Component Files (9)

**4. `src/components/LifecycleDashboard.tsx`**
- `bg-green-500`, `bg-green-100 text-green-700` for "completed" stage
- Replace with `bg-success`, `bg-success/10 text-success`

**5. `src/components/audit/AdoptionScoreGauge.tsx`**
- `text-green-500` / `text-amber-500` / `text-red-500` score colors
- Replace with `text-success` / `text-warning` / `text-destructive`

**6. `src/components/consultant/NewAuditForm.tsx`**
- `text-amber-500 fill-amber-500` on star icon for sentiment
- Replace with `text-warning fill-warning`

**7. `src/components/consultant/AdoptionAuditForm.tsx`**
- Same star icon: `text-amber-500 fill-amber-500`
- Replace with `text-warning fill-warning`

**8. `src/components/airline/InviteVendorModal.tsx`**
- `text-green-600` for success confirmation
- Replace with `text-success`

**9. `src/components/vendor/MagicLinkResponse.tsx`**
- `bg-red-500/10 text-red-500` error state, `bg-green-500/10 text-green-500` success, `bg-amber-500/10 text-amber-500` warning, `text-red-600` mandatory label, `bg-red-500/5 border-red-500/20` deal breaker row
- Replace with `bg-destructive/10 text-destructive`, `bg-success/10 text-success`, `bg-warning/10 text-warning`, `text-destructive`, `bg-destructive/5 border-destructive/20`

**10. `src/components/consultant/AuditEmptyState.tsx`**
- `bg-emerald-100` / `text-emerald-600` decorative plus icon
- Replace with `bg-success/10` / `text-success`

**11. `src/components/rfp/CreateProjectWizard.tsx`**
- Weight validation badge: `bg-green-100 text-green-700 border-green-200` / `bg-yellow-100 text-yellow-700 border-yellow-200`
- Replace with `bg-success/10 text-success border-success/30` / `bg-warning/10 text-warning border-warning/30`

**12. `src/components/SubmitProposalForm.tsx`**
- File type icons: `text-red-500` (PDF), `text-blue-500` (Word), `text-orange-500` (PPT)
- These are standard file-type association colors (PDF=red, Word=blue, PPT=orange). **No change recommended** -- these are representational, not status-driven.

## Summary

| Category | Files | Action |
|---|---|---|
| Needs migration | 10 | Replace with semantic tokens |
| Intentional branding/file-type colors | 2 | No change (Auth.tsx, SubmitProposalForm.tsx) |
| Base UI library | 1 | No change (toast.tsx) |
| Test fixtures | 1 | No change (utils.test.ts) |

## Technical Details

All replacements follow the same mapping used in previous rounds:
- `green-*` / `emerald-*` to `success`
- `red-*` / `rose-*` to `destructive`
- `amber-*` / `yellow-*` to `warning`

Opacity modifiers: backgrounds use `/10`, borders use `/30`, consistent with the established pattern.
