
## Add Drafts Tab + Cancel Draft in Sheet

### What changes and why

Currently the "Active" tab mixes together draft proposals (unsubmitted) and live submitted proposals, making it hard to tell them apart at a glance. The detail sheet also has no way to discard a draft once it is open — the only cancel option is on the card itself.

Three things will be fixed in a single file edit (`src/pages/vendor/VendorProposalsPage.tsx`):

1. **New "Drafts" tab** — split the existing "Active" tab into two separate tabs: Drafts and Submitted. Withdrawn stays as-is.
2. **Cancel Draft button inside the sheet** — visible only when the open submission is a draft, placed in the sheet footer alongside Save Draft and Submit Proposal.
3. **Sheet closes automatically after cancelling** — after a cancel-draft action triggered from inside the sheet, close the sheet and refresh the list.

---

### Tab layout (after change)

```text
[ Drafts (N) ] [ Submitted (N) ] [ Withdrawn (N) ]
```

- **Drafts** — `status === 'draft'`
- **Submitted** — `status === 'submitted'` (and not withdrawn)
- **Withdrawn** — `status === 'withdrawn'`

---

### Technical details

**File:** `src/pages/vendor/VendorProposalsPage.tsx`

**State changes:**
- Default `activeTab` value changes from `'active'` to `'drafts'` so users land on their drafts first.
- No new state variables needed — `cancellingDraftId` and `cancelDraftLoading` already exist and drive the existing confirmation dialog.

**Data filtering (replaces current `activeSubmissions`):**
```ts
const draftSubmissions     = submissions.filter(s => s.status === 'draft');
const submittedSubmissions = submissions.filter(s => s.status !== 'draft' && s.status !== 'withdrawn');
const withdrawnSubmissions = submissions.filter(s => s.status === 'withdrawn');
```

**Sheet footer — Cancel Draft button:**
- Added as a third button in the editing footer row, shown only when `selectedSubmission.status === 'draft'`.
- Clicking it sets `cancellingDraftId = selectedSubmission.id` which triggers the existing AlertDialog.
- After `handleCancelDraft` succeeds, also close the sheet (`setSelectedSubmission(null)`).

**Updated `handleCancelDraft`:**
```ts
const handleCancelDraft = async () => {
  // ... existing logic ...
  if (!error) {
    setSelectedSubmission(null); // close sheet if open
  }
};
```

**Tab triggers:**
```tsx
<TabsTrigger value="drafts">
  <Pencil /> Drafts ({draftSubmissions.length})
</TabsTrigger>
<TabsTrigger value="submitted">
  <FileText /> Submitted ({submittedSubmissions.length})
</TabsTrigger>
<TabsTrigger value="withdrawn">
  <Archive /> Withdrawn ({withdrawnSubmissions.length})
</TabsTrigger>
```

**Sheet footer layout (draft mode):**
```text
[ Cancel Draft ]  [ Save Draft ]  [ Submit Proposal ]
```
- Cancel Draft: destructive ghost variant, triggers `setCancellingDraftId(selectedSubmission.id)`
- Save Draft: outline variant (unchanged)
- Submit Proposal: primary variant (unchanged)

No database or edge function changes are required.
