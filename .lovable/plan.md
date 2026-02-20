

# Make Search Functional on RFPs Page

## Problem
The "Search projects, vendors..." input in the header bar is purely decorative -- typing in it does nothing. Users expect it to filter the RFP list below.

## Solution
Wire the search input to filter the projects list in real-time as the user types.

### Approach
1. **Add search callback to ControlTowerLayout** -- Accept an optional `onSearchChange` prop and `searchValue` prop so pages can control the search input.

2. **Add local search state in MyRFPsPage** -- Store a `searchQuery` string in state and pass it to `ControlTowerLayout`.

3. **Filter projects by search query** -- Before rendering, filter the `projects` array by matching the search query against project titles (case-insensitive). This gives instant, client-side filtering.

4. **Update the stats badges** -- The "Total" and "Active" badge counts will reflect filtered results so users get accurate feedback.

---

## Technical Details

### File: `src/components/layout/ControlTowerLayout.tsx`
- Add optional props: `searchValue?: string` and `onSearchChange?: (value: string) => void`
- Bind the `Input` element to these props (`value` and `onChange`)
- When props are not provided, the input remains a static placeholder (backward compatible)

### File: `src/pages/airline/MyRFPsPage.tsx`
- Add `const [searchQuery, setSearchQuery] = useState("")`
- Pass `searchValue={searchQuery}` and `onSearchChange={setSearchQuery}` to `ControlTowerLayout`
- Compute filtered projects: `projects.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))`
- Use `filteredProjects` for rendering the table and stat badges

### No database changes required
This is purely a client-side filter on already-fetched data.

