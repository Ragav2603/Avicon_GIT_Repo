

# Phase 4: Landing Page Redesign

## Overview
Strip all decorative animations, gradients, and "vibe-coded" elements from the landing page. Replace with clean white/slate backgrounds, 1px borders, and static layouts. Every component gets the same treatment: remove `motion.*` wrappers, remove gradient orbs/dot patterns/blur backgrounds, and use the enterprise design tokens from Phase 1.

## Files to modify (13 total)

---

### 1. Logo.tsx -- Reduce oversized dimensions
Current sizes are 80px/100px/120px, far too large for a 56px navbar.
- `sm`: `h-20` (80px) becomes `h-8` (32px)
- `md`: `h-[100px]` becomes `h-10` (40px)
- `lg`: `h-[120px]` becomes `h-12` (48px)

### 2. Navbar.tsx -- Clean enterprise header
- Replace `motion.nav` with plain `nav`, remove framer-motion import
- Replace `AnimatePresence` + `motion.div` for mobile menu with a simple conditional `div`
- Remove `bg-background/95 backdrop-blur-xl`, replace with `bg-background`
- Height: change `h-16 lg:h-20` to `h-14` (56px)
- Nav height constant for smooth scroll: change from `80` to `56`
- "Sign In" button stays `variant="secondary"`

### 3. ClosedLoopHero.tsx -- Complete rewrite to static layout
Remove entirely:
- Gradient orb (`motion.div` with radial-gradient)
- Dot pattern overlay
- SVG infinity loop path + animated circle
- Auto-cycling phase state (`useState`, `useEffect`, `setInterval`)
- All `motion.*` wrappers and `initial/animate/transition` props
- `gradient-hero-bg` and `gradient-text` classes

Replace with:
- Clean `bg-background` section with `pt-24 pb-16`
- Static headline: "Aviation's Digital Integrity Platform" in `text-foreground`
- Subheadline in `text-muted-foreground`
- Two CTA buttons: "Request Demo" (`variant="default"`, blue) + "Watch Demo" (`variant="outline"`)
- Below: 3 static feature cards in a horizontal grid (`lg:grid-cols-3`)
  - Each card: `bg-card border border-border rounded-md p-6`
  - Icon (16x16) + title + description
  - No hover transforms, no phase cycling, no number badges
- Remove loop indicator dots

### 4. TrustedPartnersMarquee.tsx -- Keep marquee, remove framer-motion
- Replace `motion.div` with a plain `div` using CSS `animate-marquee` class (already defined in index.css)
- Remove framer-motion import
- Remove hover card styling (`rounded-xl`, `bg-muted/50`), simplify to plain text items with letter initial

### 5. SectionConnector.tsx -- Delete usage from Index
- Remove `SectionConnector` import and usage from `Index.tsx`
- The component itself can remain but won't be rendered
- The `section-divider` CSS class was already removed in Phase 1

### 6. SmartProcurementSection.tsx -- Strip animations, keep content
- Remove all `motion.*` wrappers, replace with plain `div`
- Remove `useInView`, `useRef`, `useState`, `useEffect` for light-up logic
- Remove background accent blurs (`bg-secondary/5 blur-3xl`)
- Remove `gradient-text` from heading, use `text-primary` instead
- Remove animated arrow connectors (`motion.div` with bouncing arrows)
- Remove glow/ring effects from cards
- Cards: `bg-card border border-border rounded-md p-6`, no hover-translate
- Stage number badges: `bg-primary text-white` (static)
- Remove "Continuous improvement cycle" animated pill at bottom

### 7. AIDocumentIntel.tsx -- Light background, no glass cards
- Change section background from `bg-foreground` (dark) to `bg-muted`
- Remove `dot-pattern` overlay
- Replace `glass-card-dark` with `bg-card border border-border rounded-md`
- All text: change `text-white` to `text-foreground`, `text-white/60` to `text-muted-foreground`
- Remove all `motion.*` wrappers
- Remove `gradient-text` from heading
- Flow step cards: `bg-muted border border-border` instead of `bg-white/5 border-white/10`

### 8. DealBreakersSection.tsx -- Remove animations, keep compliance dashboard
- Remove background accent blur
- Change `bg-muted/30` to `bg-background`
- Remove all `motion.*` wrappers (6 instances)
- Keep the compliance dashboard visual (it's data-rich and appropriate)
- Remove `gradient-text` references if any

### 9. AdoptionROISection.tsx -- Strip motion, clean gradients
- Remove background accent blurs
- Remove all `motion.*` wrappers
- Replace `gradient-text` with `text-primary`
- Replace `bg-gradient-to-r from-secondary to-accent` header with `bg-primary`
- Replace `bg-gradient-to-r from-secondary/10 to-accent/10` callout with `bg-muted border border-border`
- Replace `bg-gradient-to-br from-green-400 to-green-600` circle with `bg-green-100` + static icon
- Progress bars: solid `bg-primary` instead of gradients

### 10. HowItWorksSection.tsx -- Remove motion, clean step cards
- Change `bg-muted/50` to `bg-muted`
- Remove all `motion.*` wrappers (many instances)
- Remove `gradient-text` from heading
- Remove `gradient-accent-bg` and `gradient-warm-bg` from step number badges, use `bg-primary text-white` and `bg-warning text-white`
- Remove gradient connection lines, use solid `bg-border` lines
- Remove spinning `RefreshCw` icon animation
- Remove the gradient "Continuous Feedback Loop" bridge, simplify to a `border-t` separator with text
- Remove emoji from subheadings

### 11. SecurityTrustStrip.tsx -- Light background treatment
- Change `bg-foreground` (dark) to `bg-muted border-y border-border`
- Update text colors from `text-primary-foreground` to `text-foreground`
- Remove all `motion.*` wrappers
- Badge cards: `bg-card border border-border`

### 12. PersonasSection.tsx -- Remove motion, keep cards
- Remove all `motion.*` wrappers
- Remove `gradient-text` from heading
- Remove `hover:-translate-y-1` from cards
- Cards: keep current structure, just static

### 13. TestimonialsSection.tsx -- Remove motion, clean stats
- Remove all `motion.*` wrappers
- Change `bg-muted/30` to `bg-background`
- Avatar: replace gradient background with `bg-muted`
- Stats section: use `font-mono` for numbers

### 14. CTASection.tsx -- Remove decorative elements
- Remove dot pattern and gradient orbs
- Keep `bg-primary` background (enterprise blue, not gradient)
- Remove `motion.*` wrappers
- Text stays white (appropriate on blue background)

### 15. AskAISection.tsx -- Remove motion
- Remove all `motion.*` and `whileHover`/`whileTap` wrappers
- Replace `motion.a` with plain `a` tags
- Change `bg-muted/30` to `bg-background`

### 16. Index.tsx -- Remove SectionConnector
- Remove `SectionConnector` import and `<SectionConnector />` usage
- Remove `SmartProcurementSection` from outside the first `Suspense` group (move it inside)

### 17. Footer.tsx -- Minor cleanup
- Change `py-16` to `py-12` (tighter)
- Remove heart emoji from copyright line: "Built with care for the aviation industry"
- Logo size will automatically shrink due to Logo.tsx change

---

## Technical Notes

- **framer-motion** remains installed (used functionally in sidebar/modals) but is removed from all 13 landing page components
- **Removed CSS classes** (`gradient-text`, `glass-card-dark`, `dot-pattern`, `gradient-hero-bg`, etc.) were already deleted in Phase 1 -- this phase removes the remaining references to them
- No new dependencies needed
- All section `id` attributes are preserved for anchor navigation

