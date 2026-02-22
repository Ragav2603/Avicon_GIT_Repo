

## Deal Breakers Without Weights, AI Import Fix, and Animated Distribution Bar

### Problem Analysis

**1. Deal Breakers should not carry weights**
Deal breakers are pass/fail criteria. Assigning percentage weights to them is conceptually wrong -- they either pass or they don't. Currently, both the creation wizard and the detail page show weight inputs for deal breakers.

**2. AI import puts most items into Deal Breakers**
The `generate-draft` edge function marks a requirement as mandatory (deal breaker) using this logic:
```
is_mandatory: q.is_mandatory ?? (q.priority === 'Critical' || q.priority === 'High')
```
Since the AI worker often labels extracted requirements as "Critical" or "High" priority, nearly everything becomes a deal breaker. The fix is to only use `is_mandatory` when explicitly provided by the AI worker, defaulting to `false`.

**3. Animated entrance for the distribution bar**
Wrap the distribution bar in a `motion.div` with a fade + slide-down animation.

---

### Changes

**A. `supabase/functions/generate-draft/index.ts`**
- Change the `is_mandatory` mapping on line 114 to default to `false` instead of falling back to priority-based logic:
  - `is_mandatory: q.is_mandatory ?? false`
  - `mandatory: q.is_mandatory ?? false`
- This ensures only items the AI explicitly flags as mandatory become deal breakers; everything else becomes a scored requirement.

**B. `src/components/rfp/GoalsBreakersEditor.tsx`**
- Remove the weight input from the deal breaker items in `renderItem`. Instead, pass a `showWeight` flag or conditionally hide the weight column when `list === 'breakers'`.
- Deal breakers will show as simple toggle + text + remove, no percentage input.

**C. `src/components/rfp/CreateProjectWizard.tsx`**
- Update `totalWeight` calculation to only sum enabled **requirements** (adoption goals), excluding deal breakers.
- Update the "Distribute Evenly" button to only distribute across enabled requirements.
- In the Review step (step 4), remove the weight percentage display next to deal breakers.
- When cross-moving an item from requirements to deal breakers, set its weight to 0. When moving from deal breakers to requirements, assign a default weight.

**D. `src/pages/airline/ProjectDetailPage.tsx`**
- Remove the weight percentage and mini progress bar from deal breaker items.
- Update the distribution bar to only show requirement weights (remove the destructive/deal breaker segment). Or keep a simplified bar showing "Requirements: X%" out of 100%.
- Wrap the distribution bar section in `<motion.div>` with `initial={{ opacity: 0, y: -8 }}` and `animate={{ opacity: 1, y: 0 }}` for an animated entrance when the tab opens.
- Update tooltip to reflect that deal breakers are unweighted pass/fail items.

**E. `src/components/rfp/DealBreakersEditor.tsx`**
- Remove the weight input from the standalone editor (for consistency, even though the unified GoalsBreakersEditor is the primary UI).

---

### Technical Details

```text
Weight model change:
  Before: totalWeight = sum(requirements.weight) + sum(dealBreakers.weight) === 100
  After:  totalWeight = sum(requirements.weight) === 100
          dealBreakers have no weight (pass/fail only)
```

The `Requirement` type in `src/types/projects.ts` still has a `weight` field. Deal breakers will simply store `weight: 0` in the database, which is backward-compatible.

