

# Avicon Enterprise UI Redesign

## Overview
A comprehensive redesign of the entire Avicon platform from its current "Aviation Blue + Deep Navy" aesthetic to a strict, information-dense Enterprise SaaS style inspired by Linear, Stripe Dashboard, and Retool. This eliminates all decorative gradients, floating orbs, and "vibe-coded" elements in favor of crisp borders, tight spacing, and data-first layouts.

## Scope Assessment

The redesign touches **every layer** of the application:
- **Design system foundation** (CSS variables, Tailwind config, fonts)
- **Core UI components** (Button, Card, Badge, Table, Skeleton)
- **3 layout shells** (Airline ControlTowerLayout, VendorControlTowerLayout, ConsultantControlTowerLayout)
- **Sidebar navigation** (AppSidebar)
- **Landing page** (Hero, sections, Navbar, Footer)
- **Dashboard pages** (Airline, Vendor, Consultant)
- **Data tables** (SubmissionReviewTable and similar)

Given the size, this plan is organized into **4 sequential phases**, each self-contained and testable.

---

## Phase 1: Design System Foundation

Replace the color palette, typography, spacing tokens, and shadow system.

### 1a. Fonts -- load Fira Sans + Fira Code
- Add Google Fonts import for `Fira Sans` (400, 500, 600, 700) and `Fira Code` (400, 500, 600) to `src/index.css`
- Update `tailwind.config.ts` font families:
  - `sans: ['Fira Sans', ...]`
  - `mono: ['Fira Code', ...]`

### 1b. Color Palette -- replace CSS variables in `src/index.css`

Light mode `:root`:
| Token | New Value | HSL |
|---|---|---|
| `--background` | #F8FAFC (Slate-50) | `210 40% 98%` |
| `--foreground` | #1E293B (Slate-900) | `222 47% 17%` |
| `--card` | #FFFFFF | `0 0% 100%` |
| `--card-foreground` | #1E293B | `222 47% 17%` |
| `--primary` | #2563EB (Enterprise Blue) | `221 83% 53%` |
| `--primary-foreground` | #FFFFFF | `0 0% 100%` |
| `--secondary` | #F1F5F9 (Slate-100) | `210 40% 96%` |
| `--secondary-foreground` | #1E293B | `222 47% 17%` |
| `--accent` | #F1F5F9 | `210 40% 96%` |
| `--accent-foreground` | #1E293B | `222 47% 17%` |
| `--muted` | #F1F5F9 | `210 40% 96%` |
| `--muted-foreground` | #64748B (Slate-500) | `215 16% 47%` |
| `--destructive` | #EF4444 | `0 84% 60%` |
| `--border` | #E2E8F0 (Slate-200) | `214 32% 91%` |
| `--input` | #E2E8F0 | `214 32% 91%` |
| `--ring` | #2563EB | `221 83% 53%` |
| `--warning` | #F97316 (Safety Orange) | `25 95% 53%` |
| `--success` | #22C55E | `142 71% 45%` |

Sidebar variables:
| Token | New Value |
|---|---|
| `--sidebar-background` | #0F172A (Slate-900) |
| `--sidebar-foreground` | #CBD5E1 (Slate-300) |
| `--sidebar-primary` | #2563EB |
| `--sidebar-accent` | #1E293B (Slate-800) |
| `--sidebar-border` | #1E293B |

### 1c. Shadows -- minimal
Replace all custom shadow variables with tight, low-diffusion shadows:
```text
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)
--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)
```

### 1d. Button component (`src/components/ui/button.tsx`)
- Set border-radius to `rounded-md` (6px)
- Default height: `h-9` (36px) for `default`, `h-10` (40px) for `lg`
- Remove `hero`, `heroOutline`, `warm`, `glass` variants
- Remove `xl` size
- Remove `shadow-md`, `hover:shadow-lg`, `hover:-translate-y-0.5` from all variants
- Add visible focus ring: `focus-visible:ring-2 focus-visible:ring-primary`
- Primary: solid `bg-primary text-white hover:bg-primary/90`
- Outline: `border border-border bg-white hover:bg-slate-50`
- Ghost: `hover:bg-slate-100`

### 1e. Remove decorative CSS classes from `src/index.css`
Strip out: `gradient-text`, `gradient-text-dark`, `gradient-hero-bg`, `gradient-hero-bg-dark`, `gradient-accent-bg`, `gradient-navy-bg`, `gradient-surface-bg`, `glass-card`, `glass-card-dark`, `hover-lift`, `card-glow`, `dot-pattern`, `section-connector`, `connecting-pipe`, `animate-float`, `animate-gradient`, and CSS gradient custom properties.

### 1f. Tailwind config cleanup (`tailwind.config.ts`)
- Remove `navy` and `aviation` color scales
- Remove `flow` keyframe/animation
- Remove `enterprise-*` shadows
- Keep accordion and fade-in animations (fast: 150ms)
- Update animation durations to 150ms (was 500ms)

---

## Phase 2: Layout Shells and Navigation

### 2a. Unified sidebar across all roles
Refactor all three layout components to share a single sidebar architecture:
- Background: `#0F172A` (Slate-900)
- Width: 240px expanded, 56px collapsed
- Active state: `bg-white/10` background + 2px left border in `#2563EB`
- Text: `#CBD5E1` (Slate-300), active: `#FFFFFF`
- Icons: Lucide, 16x16
- Group labels: 10px, uppercase, `#64748B`, letter-spacing wide
- No role badge section (remove "Vendor Portal" / "Consultant Portal" banners)

### 2b. Top header bar (all roles)
- Height: 48px (down from 64px)
- Breadcrumbs on the left (mandatory on all dashboard pages)
- Primary action buttons right-aligned
- Search input: white background, `#E2E8F0` border, `#2563EB` focus ring
- Notifications bell: no changes to behavior, just tighter spacing
- Remove backdrop-blur from header

### 2c. Content area
- Background: `#F8FAFC`
- Padding: 24px (down from 32px on desktop)
- Max content width: none (full width of available space)

---

## Phase 3: Dashboard Pages Redesign

### 3a. Airline Dashboard (`src/pages/AirlineDashboard.tsx`)
**Layout: KPI cards (top) + Active RFPs table (bottom)**

KPI Cards (4 across):
- White background, 1px `#E2E8F0` border, `border-radius: 6px`
- Label: top, 12px, `#64748B`, uppercase
- Value: 24px, `#1E293B`, `font-family: 'Fira Code'`
- Trend indicator: small arrow + percentage, green/red
- No icons in cards (remove icon circles)
- No framer-motion animations

Active RFPs Table:
- Stripe-style table replacing the current card list
- Headers: 11px uppercase bold, `#64748B`
- Rows: hover `bg-slate-50`, 1px bottom border
- Status: pill badges with pastel backgrounds (e.g., `bg-green-100 text-green-800`)
- Monospace font for dates and IDs
- Right-aligned numeric columns

Remove: Quick Actions cards section, ConsultingRequestForm, motion wrappers

### 3b. Vendor Dashboard (`src/pages/VendorDashboard.tsx`)
Same pattern: KPI stats row + opportunities data table. Remove motion wrappers.

### 3c. Consultant Dashboard (`src/pages/ConsultantDashboard.tsx`)
Same pattern: Stats row + audits data table. Already close to this pattern.

### 3d. SubmissionReviewTable (`src/components/dashboard/SubmissionReviewTable.tsx`)
- Headers: `text-xs uppercase font-semibold text-slate-500 tracking-wide`
- Numbers/scores: `font-mono` class
- Score column: right-aligned, monospace
- Date column: monospace
- Compliance badges: pastel pill style (`bg-green-100 text-green-800`)
- Row hover: `hover:bg-slate-50`
- Remove motion.tr animations

### 3e. MyRFPsPage (`src/pages/airline/MyRFPsPage.tsx`)
Convert from card grid to full-width data table with columns: Title, Status, Deadline, Created, Actions.

### 3f. AdoptionTrackerPage
- Replace gauge component with simple numeric display
- Convert tool breakdown to a data table
- AI recommendations: simple bordered cards, no color-coded left borders

---

## Phase 4: Landing Page Redesign

### 4a. Navbar (`src/components/Navbar.tsx`)
- Height: 56px
- White background, 1px bottom border, no blur
- Logo left, nav links center, CTA right
- Remove framer-motion entrance animation
- Sign In button: outline style. "Request Demo": primary solid blue

### 4b. Hero (`src/components/ClosedLoopHero.tsx`)
- Remove gradient orbs, dot pattern, SVG infinity loop, animated circles
- Clean white background
- Headline: `#1E293B`, tight leading
- Subheadline: `#64748B`
- Two CTA buttons: "Request Demo" (blue solid) + "Watch Demo" (outline)
- Below: 3 feature cards in a row (no animation, no phase cycling)
  - Each card: white, 1px border, icon + title + description
  - Static layout, no auto-rotation

### 4c. Section components
- Remove `SectionConnector` usage
- Remove all `motion.div` entrance animations from sections
- All sections: white or `#F8FAFC` background, no gradients
- Section headings: 11px uppercase label + 28px bold title + 16px subtitle

### 4d. Footer (`src/components/Footer.tsx`)
- White background, 1px top border
- Tighter spacing, 14px text
- Remove heart emoji from copyright line

### 4e. Logo (`src/components/Logo.tsx`)
- Reduce sizes: sm=32px, md=40px, lg=48px (currently 80-120px which is oversized)

---

## Technical Notes

- **Framer Motion**: Will be retained as a dependency but usage reduced to only functional animations (accordion open/close, modal transitions). All decorative entrance animations removed.
- **Font loading**: Fira Sans + Fira Code loaded via Google Fonts CDN in index.css (same pattern as current Inter import).
- **Dark mode**: Variables will be updated to match the new Slate-based palette but dark mode is secondary priority.
- **No new dependencies**: Everything uses existing shadcn/ui + Tailwind + Lucide.
- **Breakpoints**: No changes to responsive breakpoints. The 12-column grid is enforced via Tailwind's grid utilities.

## Implementation Order
1. Phase 1 first (foundation) -- everything else depends on it
2. Phase 2 (layouts) -- structural shell
3. Phase 3 (dashboards) -- data-dense pages
4. Phase 4 (landing) -- public-facing pages

Each phase will be implemented as a separate prompt to keep changes manageable and testable.

