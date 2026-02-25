

# Aesthetic Update: Deep Navy + Vibrant Teal

Apply the new color palette, increased border radii, and glassmorphism styling across the design system.

---

## Color Palette Shift

Current charcoal (#22282A-based) moves to deep navy (#0B121F-based). Primary accent stays teal but shifts to #36D1DC.

| Token | Current HSL | New HSL (approx) |
|-------|------------|-------------------|
| `--background` | `200 12% 15%` | `220 50% 8%` (#0B121F) |
| `--foreground` | `220 15% 95%` | `210 20% 95%` (stays light) |
| `--card` | `200 10% 19%` | `220 40% 12%` (~#111D2E) |
| `--primary` | `172 70% 62%` | `185 72% 54%` (#36D1DC) |
| `--secondary` | `200 10% 23%` | `220 35% 16%` |
| `--muted` | `200 10% 20%` | `220 30% 14%` |
| `--border` | `200 10% 24%` | `220 30% 18%` |
| `--sidebar-background` | `200 15% 10%` | `220 55% 6%` |

---

## Files to Change

### 1. `frontend/src/index.css`

- Update all `:root` CSS variables to the deep navy palette above
- Update `.dark` block to match (identical since we're dark-first)
- Change `--radius` from `0.5rem` to `1rem` (16px base)
- Update `--aviation-blue` from `#22282A` to `#0B121F`
- Update `--aviation-cyan` from `#5CE0D2` to `#36D1DC`
- Update `.glass-nav` background to `hsl(220 50% 8% / 0.80)` with `blur(24px)`
- Update `.enterprise-gradient` radial gradients to use `hsl(185 72% 54%)` tints
- Update `.enterprise-card` hover glow to use the new teal HSL
- Update `.section-divider` gradient line color to new teal
- Add a new `.glass-card` utility class for glassmorphism cards:
  ```css
  .glass-card {
    background: hsl(220 40% 12% / 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid hsl(220 30% 18% / 0.5);
  }
  ```

### 2. `frontend/tailwind.config.ts`

- Update `borderRadius` values to reflect the larger radii:
  - `lg`: stays as `var(--radius)` (now 1rem/16px via CSS var)
  - Add `xl`: `calc(var(--radius) + 0.5rem)` (24px)
  - `md`: `calc(var(--radius) - 4px)` (12px)
  - `sm`: `calc(var(--radius) - 8px)` (8px)

### 3. `frontend/src/components/ui/button.tsx`

- Change base class `rounded-md` to `rounded-xl` for the pill/high-radius look
- Update size variants: `sm` and `lg` from `rounded-md` to `rounded-xl`

### 4. `frontend/src/components/ui/card.tsx`

- Change Card base from `rounded-lg` to `rounded-2xl` for 24px container radius

### 5. `frontend/tailwind.config.ts` (root)

- Mirror the same `borderRadius` changes in the root `tailwind.config.ts`

---

## Summary

- **3 config/style files**: `index.css`, both `tailwind.config.ts`
- **2 UI primitives**: `button.tsx`, `card.tsx`
- All downstream components auto-adapt via CSS variables -- no further component changes needed
- Typography (Satoshi) and layout spacing remain unchanged

