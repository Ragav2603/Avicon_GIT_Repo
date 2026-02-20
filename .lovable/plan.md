

# Replace Hardcoded Colors with Semantic Design Tokens

## Scope
All remaining landing page sections and dashboard pages that still use hardcoded Tailwind color classes (e.g., `bg-green-500`, `text-red-600`, `border-amber-200`). The existing semantic tokens `success`, `warning`, and `destructive` are already defined in `tailwind.config.ts` and `index.css`.

## Files to Update

### Landing Page Sections (7 files)

**1. `src/components/DealBreakersSection.tsx`**
- `text-green-600` / `text-red-500` / `text-amber-500` in summary stats -> `text-success` / `text-destructive` / `text-warning`
- `bg-green-50 border-green-200` etc. in requirement rows -> `bg-success/10 border-success/30` / `bg-destructive/10 border-destructive/30` / `bg-warning/10 border-warning/30`
- Dark mode variants (`dark:bg-green-950/20` etc.) removed since semantic tokens handle theming automatically
- Status badge colors -> same pattern
- Alert banner `bg-red-50` / `text-red-700` -> `bg-destructive/10` / `text-destructive`
- Icon colors -> `text-success` / `text-destructive` / `text-warning`

**2. `src/components/AdoptionROISection.tsx`**
- `text-green-600` / `text-amber-600` in status badges -> `text-success` / `text-warning`
- `bg-green-100` / `bg-amber-100` / `bg-green-900/30` -> `bg-success/10` / `bg-warning/10`
- `bg-green-500` / `bg-amber-500` progress bars -> `bg-success` / `bg-warning`
- Overall score circle `bg-green-100` -> `bg-success/10`
- Recommendation banner -> `bg-success/10` / `text-success` / `border-success/30`

**3. `src/components/AIDocumentIntel.tsx`**
- Go/No-Go guardrails: `bg-green-50 border-green-200` -> `bg-success/10 border-success/30`
- `bg-red-50 border-red-200` -> `bg-destructive/10 border-destructive/30`
- `text-green-600` / `text-red-500` -> `text-success` / `text-destructive`
- Remove explicit dark mode overrides

**4. `src/components/GoNoGoSection.tsx`**
- "All Clear" badge `bg-green-100 text-green-700` -> `bg-success/10 text-success`
- Pass/fail row backgrounds `bg-green-50 border-green-200` / `bg-red-50 border-red-200` -> `bg-success/10 border-success/30` / `bg-destructive/10 border-destructive/30`
- Icon circles `bg-green-500` / `bg-red-500` -> `bg-success` / `bg-destructive`
- Text colors `text-green-800` / `text-red-800` -> `text-success` / `text-destructive`
- Critical badge colors -> same pattern
- Summary dots `bg-green-500` / `bg-red-500` -> `bg-success` / `bg-destructive`

**5. `src/components/TestimonialsSection.tsx`**
- Vendor Partner badge `bg-green-100 text-green-700` -> `bg-success/10 text-success`
- Airline Executive badge `bg-blue-100 text-blue-700` -> `bg-primary/10 text-primary`

### Dashboard Pages (5 files)

**6. `src/pages/vendor/VendorAnalyticsPage.tsx`**
- Win Rate stat: `text-green-500` / `bg-green-500/10` -> `text-success` / `bg-success/10`
- Deal Breaker Fails: `text-red-500` / `bg-red-500/10` -> `text-destructive` / `bg-destructive/10`
- Proposal status breakdown: Accepted `bg-green-500` -> `bg-success`, Shortlisted `bg-yellow-500` -> `bg-warning`, Declined `bg-red-500` -> `bg-destructive`
- Monthly trend "Wins" bar `bg-green-500` -> `bg-success`
- Hover border `hover:border-red-500/30` -> `hover:border-destructive/30`

**7. `src/pages/vendor/VendorProposalsPage.tsx`**
- Status badges: Accepted `bg-green-500/10 text-green-600` -> `bg-success/10 text-success`, Shortlisted `bg-yellow-500/10 text-yellow-600` -> `bg-warning/10 text-warning`, Declined `bg-red-500/10 text-red-600` -> `bg-destructive/10 text-destructive`
- AI score colors: `text-green-500` / `text-yellow-500` / `text-red-500` -> `text-success` / `text-warning` / `text-destructive`
- Progress bar fills -> same pattern

**8. `src/pages/RFPDetails.tsx`**
- `statusConfig`: accepted `bg-green-500/20 text-green-600` -> `bg-success/10 text-success border-success/30`, rejected -> destructive, shortlisted -> warning
- `getScoreColor()`: green/yellow/orange/red ranges -> success/warning/warning/destructive
- Accept button `bg-green-600` -> `bg-success`, Reject button `text-red-600` -> `text-destructive`, Shortlist button -> `text-warning`
- Dialog confirm button colors -> same pattern
- Dialog header icon colors -> semantic tokens

**9. `src/pages/airline/MyRFPsPage.tsx`**
- `STATUS_STYLES`: open `bg-green-100 text-green-700` -> `bg-success/10 text-success`, draft -> `bg-warning/10 text-warning`, review -> `bg-primary/10 text-primary`
- Active badge `text-green-600 border-green-200 bg-green-50` -> `text-success border-success/30 bg-success/10`

**10. `src/pages/airline/ProjectDetailPage.tsx`**
- `STATUS_STYLES`: same pattern as MyRFPsPage, plus remove explicit dark mode overrides

### Remaining Components (4 files)

**11. `src/components/dashboard/SubmissionReviewTable.tsx`**
- `getComplianceBadge()`: pass `bg-green-100 text-green-700` -> `bg-success/10 text-success`, fail -> destructive, partial -> warning
- `getScoreColor()`: green/amber/red -> success/warning/destructive

**12. `src/components/consultant/ScoreGauge.tsx`**
- `getScoreColor()`: `stroke-emerald-500` / `text-emerald-600` / `bg-emerald-50` -> `stroke-success` / `text-success` / `bg-success/10` (and similarly for amber -> warning, rose -> destructive)

**13. `src/components/consultant/CSVUploader.tsx`**
- Error text `text-red-600` -> `text-destructive`

**14. `src/components/admin/InviteCodesManager.tsx`**
- Active/Inactive toggle: `bg-green-500/10 text-green-600` -> `bg-success/10 text-success` / `bg-destructive/10 text-destructive`

## Mapping Reference

| Hardcoded Color | Semantic Token |
|---|---|
| green-50/100/500/600/700 | success (bg-success/10, text-success, bg-success) |
| red-50/100/500/600/700 | destructive |
| amber-50/100/500/600/700 | warning |
| yellow-500/600 | warning |
| orange-500/600 | warning |
| emerald-500/600 | success |
| rose-500/600 | destructive |
| blue-100/700 (role badges) | primary |

## Notes
- The `toast.tsx` file in `src/components/ui/` uses hardcoded `red-*` classes as part of the shadcn `destructive` variant group styling -- these will NOT be changed as they are part of the base UI library.
- Explicit `dark:` overrides can be removed since the CSS variables in `index.css` already define separate light/dark values for each token.

