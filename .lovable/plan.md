

## Changes

### 1. Update "RFP Marketplace" nav link target
In `src/components/Navbar.tsx`, change the `href` for "RFP Marketplace" from `#smart-procurement` to `#ai-document-intel` so it scrolls to the AI Document Intel section.

### 2. Add "How It Works" section to the landing page after Adoption Ops
In `src/pages/Index.tsx`:
- Import the `HowItWorksSection` component (lazy-loaded).
- Place it right after `AdoptionROISection` inside the first Suspense group.

### 3. Fix existing build errors
- **`src/pages/Auth.tsx`**: Remove duplicate import lines that are causing "Duplicate identifier" errors.
- **`src/benchmarks/submission_review_table_sort.test.ts`**: Fix the type comparison issues (lines 41-47).

---

### Technical Details

**Navbar.tsx** -- single line change in the `navLinks` array:
```ts
{ name: "RFP Marketplace", href: "#ai-document-intel" },
```

**Index.tsx** -- add lazy import and render:
```ts
const HowItWorksSection = lazy(() => import("@/components/HowItWorksSection.tsx"));
```
Then place `<HowItWorksSection />` after `<AdoptionROISection />` inside the existing Suspense boundary.

**Auth.tsx** -- deduplicate the repeated imports at the top of the file.

**submission_review_table_sort.test.ts** -- fix the type narrowing logic around the sort direction comparisons.
