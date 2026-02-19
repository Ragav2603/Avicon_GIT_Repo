## 2025-02-18 - [Fix Cumulative Score Bug and Optimize Re-renders in ProposalDrafter]
**Learning:** Updating state based on current state inside a `useEffect` that depends on a rapidly changing value (like text input) can lead to logic bugs (cumulative addition) and unnecessary re-renders.
**Action:** Use derived state (calculated during render with `useMemo`) instead of syncing state with `useEffect` when the value is deterministic.
