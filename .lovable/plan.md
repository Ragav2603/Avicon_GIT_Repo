
## What is already done

After reviewing both files in full:

- The Drafts / Submitted / Withdrawn tab split on My Proposals is already implemented.
- The Cancel Draft button inside the sheet footer is already implemented.
- The sheet closes after cancel draft is already implemented.
- Submission status is already reflected in the action button text (Draft Response / Continue Draft / Submitted / Resubmit).

## What still needs to be built

### 1. Submission status badge on OpportunityRadar cards

Each card currently shows only the match eligibility badge ("100% Eligible", "Gap Analysis Required", "Ineligible"). There is no at-a-glance indicator of whether the vendor has already submitted, saved a draft, or withdrawn.

A second badge row will be added below the match badge, visible only when a submission exists:

| Status | Badge appearance |
|---|---|
| `submitted` | Blue — "Submitted" with CheckCircle icon |
| `draft` | Amber — "Draft Saved" with Pencil icon |
| `withdrawn` | Muted grey — "Withdrawn" with Archive icon |

### 2. Ensure the OpportunityRadar data stays fresh after actions

When a vendor submits or saves a draft from the ProposalDrafter, the OpportunityRadar currently does not refresh. The `VendorDashboard` page holds both `OpportunityRadar` and `ProposalDrafter` — the `onOpenChange` callback can be extended to trigger a re-fetch of the RFP list when the drafter closes.

---

## Technical plan

### File 1: `src/components/vendor/OpportunityRadar.tsx`

**Add a `getSubmissionBadge` helper** (alongside the existing `getMatchBadge`):

```ts
const getSubmissionBadge = (status: string | null) => {
  switch (status) {
    case 'submitted':
      return <Badge ...>Submitted</Badge>;
    case 'draft':
      return <Badge ...>Draft Saved</Badge>;
    case 'withdrawn':
      return <Badge ...>Withdrawn</Badge>;
    default:
      return null;
  }
};
```

**Render it** in the card header area, between the match badge row and the title, only when `rfp.submissionStatus` is non-null.

**Expose a `onClose` / `onRefresh` prop** so the parent can trigger a refresh:

```ts
interface OpportunityRadarProps {
  onDraftResponse: (rfp: RFP) => void;
  refreshSignal?: number;  // increment to trigger re-fetch
}
```

In the `useEffect`, add `refreshSignal` as a dependency so the list re-fetches when the ProposalDrafter closes.

### File 2: `src/pages/VendorDashboard.tsx`

Add a `refreshSignal` state (integer):

```ts
const [refreshSignal, setRefreshSignal] = useState(0);
```

Pass it to `OpportunityRadar` and increment it when `ProposalDrafter` closes with `onOpenChange`:

```tsx
<ProposalDrafter
  ...
  onOpenChange={(open) => {
    setShowProposalDrafter(open);
    if (!open) setRefreshSignal(s => s + 1);
  }}
/>
<OpportunityRadar
  onDraftResponse={handleDraftResponse}
  refreshSignal={refreshSignal}
/>
```

---

## Summary of changes

| File | Change |
|---|---|
| `src/components/vendor/OpportunityRadar.tsx` | Add submission status badge helper + render in card; add `refreshSignal` prop to trigger re-fetch |
| `src/pages/VendorDashboard.tsx` | Add `refreshSignal` state; wire `ProposalDrafter` close → refresh |

No database or edge function changes are required.
