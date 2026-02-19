
# Cleanup: Remove Remaining Legacy CSS Classes

## Summary
The landing page redesign from Phase 4 looks correct -- hero, sections, footer, and mobile responsiveness are all clean with no console errors. However, **8 files** still reference deleted CSS classes (`gradient-text`, `dot-pattern`, `gradient-hero-bg`) that no longer exist in the stylesheet. These are older components not currently rendered on the landing page but should be cleaned up for consistency.

## Verification Results

- **Hero**: Static layout with clean typography, blue CTA, 3 feature cards -- correct on desktop and mobile
- **Navbar**: 56px fixed height, no blur, hamburger menu on mobile -- correct
- **Marquee**: CSS `animate-marquee` scrolling partner logos with letter initials -- working
- **Footer**: "Built with care for the aviation industry" (no emoji), newsletter form -- correct
- **Mobile (390px)**: Cards stack, text wraps, buttons center -- responsive
- **Console**: Zero errors

## Files to Clean Up

Replace `gradient-text` with `text-primary`, remove `dot-pattern` divs, remove `gradient-hero-bg`:

### 1. `src/pages/Auth.tsx` (line 321)
- `<span className="gradient-text">Con</span>` changes to `<span className="text-primary">Con</span>`

### 2. `src/pages/Onboarding.tsx` (line 224)
- Same `gradient-text` to `text-primary` swap on "Con"

### 3. `src/pages/RFPDetails.tsx` (line 299)
- Same `gradient-text` to `text-primary` swap on "Con"

### 4. `src/components/ClosedLoopSection.tsx` (line 68)
- `<span className="gradient-text">Loop</span>` to `<span className="text-primary">Loop</span>`

### 5. `src/components/LifecycleDashboard.tsx` (lines 48, 63)
- Remove `<div className="absolute inset-0 dot-pattern opacity-30" />`
- `gradient-text` to `text-primary` on "Dashboard"

### 6. `src/components/HeroSection.tsx` (lines 7, 9, 67, 200)
- Remove `gradient-hero-bg` from section className
- Remove `<div className="absolute inset-0 dot-pattern opacity-40" />`
- Replace `gradient-text` with `text-primary` (2 instances)

### 7. `src/components/FeaturesSection.tsx` (line 95)
- `<span className="gradient-text">Every Stage</span>` to `<span className="text-primary">Every Stage</span>`

### 8. `src/components/GoNoGoSection.tsx` (lines 23, 41)
- Remove `<div className="absolute inset-0 dot-pattern opacity-30" />`
- `gradient-text` to `text-primary` on "Guardrails"

## Technical Details
- All replacements are simple string swaps: `gradient-text` becomes `text-primary`
- All `dot-pattern` and `gradient-hero-bg` references are deleted (the CSS classes were removed in Phase 1)
- These components are legacy/unused on the current landing page but may be referenced elsewhere, so they should compile cleanly
- No structural or behavioral changes
