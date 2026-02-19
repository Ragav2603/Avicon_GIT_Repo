

# Phase 2: Layout Shells and Navigation

## Summary
Unify all three role-specific layout components (Airline, Vendor, Consultant) to share a consistent sidebar and header architecture. The Vendor and Consultant layouts currently use custom sidebars with framer-motion; they will be refactored to use the shadcn `SidebarProvider` + `AppSidebar` pattern already used by the Airline layout. The header bar will be tightened to 48px across all roles.

---

## Changes

### 1. Refactor AppSidebar to accept role-specific nav items and user label

**File:** `src/components/layout/AppSidebar.tsx`

Currently hardcoded to Airline nav items. Refactor to accept `navItems` and `roleLabel` as props so all three roles can share it.

- Add props: `navItems` (array of `{title, url, icon}`) and `roleLabel` (string like "Airline Manager", "Vendor", "Consultant")
- Keep existing structure (SidebarProvider pattern, header with Plane icon + "AviCon", footer with user info)
- Active state styling: add a 2px left border (`border-l-2 border-primary`) to active items via the `activeClassName` on NavLink
- Remove the `description` field from nav items (unused in rendering)

### 2. Update ControlTowerLayout (Airline)

**File:** `src/components/layout/ControlTowerLayout.tsx`

- Header height: change `h-16` to `h-12` (48px)
- Remove `backdrop-blur-sm` and `bg-background/95`, replace with `bg-background`
- Search input: change `bg-muted/50 border-transparent` to `bg-white border-border focus:border-primary`
- Content padding: change `p-4 md:p-6 lg:p-8` to `p-4 md:p-6` (tighter)
- Background: change `bg-muted/30` to `bg-background` (uses the Slate-50 from Phase 1)
- Pass Airline-specific `navItems` and `roleLabel="Airline Manager"` to AppSidebar

### 3. Rewrite VendorControlTowerLayout to use shared pattern

**File:** `src/components/layout/VendorControlTowerLayout.tsx`

Complete rewrite to match the Airline layout structure:
- Remove all custom sidebar code (desktop aside, mobile AnimatePresence overlay, role badges)
- Remove framer-motion import
- Use `SidebarProvider` + `AppSidebar` + `SidebarInset` pattern
- Pass vendor-specific nav items to AppSidebar:
  - Dashboard: `/vendor-dashboard` (Radar icon)
  - My Proposals: `/vendor-dashboard/proposals` (FileEdit icon)
  - Performance: `/vendor-dashboard/analytics` (TrendingUp icon)
  - Settings: `/vendor-dashboard/settings` (Settings icon)
- Pass `roleLabel="Vendor"` to AppSidebar
- Header: 48px height, SidebarTrigger, title/subtitle, search, notifications, avatar
- Content: same padding as Airline (`p-4 md:p-6`)
- Remove the separate "Page Header" section -- title is shown in the top header bar

### 4. Rewrite ConsultantControlTowerLayout to use shared pattern

**File:** `src/components/layout/ConsultantControlTowerLayout.tsx`

Same treatment as Vendor:
- Remove all custom sidebar code and framer-motion
- Use `SidebarProvider` + `AppSidebar` + `SidebarInset` pattern
- Pass consultant-specific nav items:
  - Adoption Audits: `/consultant-dashboard` (ClipboardCheck icon)
  - Clients: `/consultant-dashboard/clients` (Users icon)
  - Analytics: `/consultant-dashboard/analytics` (BarChart3 icon)
  - Settings: `/consultant-dashboard/settings` (Settings icon)
- Pass `roleLabel="Consultant"` to AppSidebar
- Header: 48px, same structure as Airline/Vendor
- Content padding: `p-4 md:p-6`

### 5. Sidebar active state enhancement

**File:** `src/components/layout/AppSidebar.tsx`

Update the active NavLink styling to use a left border indicator:
```
activeClassName="bg-white/10 text-white border-l-2 border-primary"
```
This replaces the current `bg-sidebar-accent text-sidebar-accent-foreground`.

---

## Technical Details

### AppSidebar new interface
```ts
interface AppSidebarProps {
  navItems: Array<{
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  roleLabel?: string;
}
```

The Airline `ControlTowerLayout` will import and pass its own nav items. The Vendor and Consultant layouts do the same with their respective items.

### Notification logic
Each layout keeps its own notification state and dropdown (no change to notification behavior). The notification dropdown markup is duplicated across layouts but this is intentional -- each role has different mock notifications.

### Files touched
1. `src/components/layout/AppSidebar.tsx` -- add props, update active styling
2. `src/components/layout/ControlTowerLayout.tsx` -- header height, remove blur, tighter padding, pass props to AppSidebar
3. `src/components/layout/VendorControlTowerLayout.tsx` -- full rewrite to SidebarProvider pattern
4. `src/components/layout/ConsultantControlTowerLayout.tsx` -- full rewrite to SidebarProvider pattern

### No breaking changes to page components
All pages that import these layouts use the same `{children, title, subtitle, actions}` interface, which is preserved. No page-level changes needed.

