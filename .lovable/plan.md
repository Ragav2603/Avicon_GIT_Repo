

# Theme Redesign: Effortel-Inspired Dark Aesthetic

Transform AviCon's landing page from a light enterprise theme to a dark, premium Effortel-inspired design with the Satoshi font, dark charcoal backgrounds, cyan accents, and refined typography.

---

## Design Direction

Effortel uses:
- **Dark background** (#22282A / near-black charcoal) as the primary surface
- **Light off-white** (#F0F2F5) as a secondary/contrast background
- **Cyan/teal accent** (~#5CE0D2) for CTAs and highlights
- **Satoshi Variable** font family for all text
- **Large, bold display headings** with tight letter-spacing
- **Rounded pill-shaped buttons** with dark fills and cyan accents
- **Subtle, minimal UI** -- no heavy shadows or gradients, clean spacing
- **Hidden scrollbars**, smooth scrolling

---

## Files to Change

### 1. `frontend/src/index.css` -- Global Theme Overhaul

- Replace Google Fonts import from Fira Sans/Fira Code to **Satoshi** (via CDN or self-hosted woff2)
- Update `:root` (light mode) CSS variables to use Effortel's dark palette as default:
  - `--background`: dark charcoal (#22282A / ~210 10% 15%)
  - `--foreground`: off-white (#F0F2F5 / ~220 15% 95%)
  - `--card`: slightly lighter dark (#2A3035 / ~210 10% 19%)
  - `--primary`: cyan accent (#5CE0D2 / ~172 70% 62%)
  - `--primary-foreground`: dark (#22282A)
  - `--muted`: dark gray (#333A40)
  - `--muted-foreground`: medium gray (#8A9199)
  - `--border`: subtle dark border (#3A4149)
  - `--accent`: cyan (#5CE0D2)
  - `--secondary`: slightly lighter surface (#2E353B)
- Update body font-family to `'Satoshi Variable', 'Satoshi', system-ui, sans-serif`
- Add smooth scrolling to html (`scroll-behavior: smooth`)
- Hide scrollbars globally (already partially done, ensure complete)
- Update `.glass-nav` to use dark glass effect (`bg-[#22282A]/90 backdrop-blur-xl`)
- Update `.enterprise-gradient` to use dark radial gradients with cyan tints
- Update `.enterprise-card` hover to use cyan border glow

### 2. `frontend/tailwind.config.ts` -- Font Family Update

- Change `fontFamily.sans` to `['Satoshi Variable', 'Satoshi', 'system-ui', 'sans-serif']`
- Change `fontFamily.mono` to keep Fira Code or switch to a monospace that pairs well

### 3. `frontend/src/components/Navbar.tsx` -- Dark Navbar Styling

- Nav links: change `text-muted-foreground hover:text-foreground` (these will auto-adapt via CSS vars, but verify contrast)
- The glassmorphism will pick up from the updated `.glass-nav` class
- Sign In button: change to cyan accent styling (`bg-primary text-primary-foreground`)
- Mobile menu: ensure `bg-background` picks up the dark background

### 4. `frontend/src/components/ClosedLoopHero.tsx` -- Dark Hero

- Remove `enterprise-gradient` class (or it will auto-adapt)
- Badge: update to use cyan-tinted styling (`bg-primary/10 border-primary/20 text-primary`)
- Heading: ensure text is white/off-white (will auto-adapt via `text-foreground`)
- "Request Demo" button: style as dark pill with cyan border or filled cyan
- "Watch Demo" button: outline style with light border
- Feature cards: will auto-adapt via `enterprise-card` class and CSS vars

### 5. `frontend/src/components/HowItWorksSection.tsx` -- Dark Section

- Change `bg-muted` to `bg-background` or a slightly different dark shade
- Cards already use `bg-card` and `border-border` which will auto-adapt
- Step number circles: keep `bg-primary` (now cyan)

### 6. `frontend/src/components/SecurityTrustStrip.tsx` -- Dark Strip

- Remove hardcoded Tailwind color classes (`text-blue-600`, `bg-blue-50`, etc.)
- Replace with semantic tokens that work on dark backgrounds:
  - Use `bg-primary/10 text-primary` for all badge icons (or keep varied but use dark-safe colors like `text-blue-400`, `text-emerald-400`, `text-violet-400`, `text-amber-400` with `bg-blue-500/10`, etc.)

### 7. `frontend/src/components/CTASection.tsx` -- Cyan CTA

- Change `bg-primary` section background to use a gradient or keep cyan
- Button: invert to dark button on cyan background
- Stats text: ensure contrast on cyan background

### 8. `frontend/src/components/PersonasSection.tsx` -- Dark Cards

- Will mostly auto-adapt via CSS vars
- Verify `bg-background` and card styles look good on dark

### 9. `frontend/src/components/TestimonialsSection.tsx` -- Dark Testimonials

- Will auto-adapt via CSS vars
- Stats bar at bottom: `bg-card` will be dark automatically

### 10. `frontend/src/components/FAQSection.tsx` -- Dark FAQ

- Change `bg-muted/50` to work with dark theme (auto-adapts)

### 11. `frontend/src/components/Footer.tsx` -- Dark Footer

- Will auto-adapt since it uses `bg-background` and semantic colors
- Social icons: `bg-muted` and `border-border` will auto-adapt
- Newsletter input: ensure dark input styling

### 12. `frontend/src/components/ScrollExperience.tsx` -- Already Dark

- This section already uses `bg-aviation-blue` with white text -- no changes needed, but could update the aviation-blue to match the new charcoal palette for consistency

### 13. `frontend/src/components/AskAISection.tsx` -- Dark Section

- Will auto-adapt via CSS vars

### 14. `frontend/src/components/AIDocumentIntel.tsx` & `AIExtractionShowcase.tsx`

- Will auto-adapt via CSS vars, but verify hardcoded `bg-white` references and replace with `bg-card`

### 15. `frontend/src/components/TrustedPartnersMarquee.tsx`

- Ensure marquee background and text colors work on dark

---

## Technical Details

The majority of the theme change is achieved by updating CSS variables in `index.css`. Since the codebase already uses semantic tokens (`bg-background`, `text-foreground`, `bg-card`, etc.) throughout, most components will automatically adapt. The key work is:

1. **CSS variables** in `:root` -- swap the entire light palette to dark Effortel values
2. **Font swap** -- Satoshi Variable via CDN `@font-face`
3. **Hardcoded colors** -- scan for any `bg-white`, `text-black`, or Tailwind color literals that won't adapt (e.g., `bg-white` in HeroSection cards) and replace with `bg-card`
4. **SecurityTrustStrip** -- has hardcoded `dark:` variants and explicit Tailwind colors that need updating
5. **Button styling** -- ensure primary buttons render as cyan pills matching Effortel's CTA style

Components with hardcoded colors to fix:
- `HeroSection.tsx`: `bg-white` on cards (lines 108, 207)
- `SecurityTrustStrip.tsx`: hardcoded `text-blue-600 dark:text-blue-400` etc.
- Any other `bg-white` or literal color references

Estimated files to modify: ~5-6 files (CSS + tailwind config + a few components with hardcoded colors). Most components auto-adapt.

