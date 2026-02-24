## 2025-02-18 - [Fix Cumulative Score Bug and Optimize Re-renders in ProposalDrafter]
**Learning:** Updating state based on current state inside a `useEffect` that depends on a rapidly changing value (like text input) can lead to logic bugs (cumulative addition) and unnecessary re-renders.
**Action:** Use derived state (calculated during render with `useMemo`) instead of syncing state with `useEffect` when the value is deterministic.

## 2024-05-22 - Supabase Auth Event Handling
**Learning:** `onAuthStateChange` fires for multiple event types including `TOKEN_REFRESHED`. Using it to fetch user data without filtering can lead to redundant network requests every hour (or token lifespan) even if the user identity hasn't changed.
**Action:** Always filter `onAuthStateChange` events. Skip expensive data fetching for `TOKEN_REFRESHED` unless the user ID has actually changed. Use `Promise.all` for dependent fetches to improve concurrency.
