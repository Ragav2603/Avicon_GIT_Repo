

# Scrollytelling Airplane Sequence + Bug Fix

## Overview
Build an Awwwards-level scroll-linked image sequence animation where an airplane disassembles as the user scrolls. This replaces (or augments) the existing `ScrollExperience` section on the landing page. Also fix the existing TypeScript build error.

---

## 1. Fix Build Error in ResponseWizard.tsx

The `activeTab` state type is `'templates' | 'search'` but is initialized with `'manual'` as a possible value and compared against `'manual'`. The fix: remove `'manual'` from the union type since there's no "manual" tab, OR change the comparison to check for something valid. Looking at the code, `activeTab` is typed as `'templates' | 'search' | 'manual'` but the `Tabs` component only has `'search'` and `'templates'` values. The fix is to remove `'manual'` from the type and change the condition `activeTab !== 'manual'` to always show the button (or use a different condition).

**File:** `frontend/src/components/platform/response-wizard/ResponseWizard.tsx`
- Remove `'manual'` from the `activeTab` state union type
- Change `activeTab !== 'manual'` to `true` (or just remove the conditional wrapper)
- Remove `activeTab !== 'manual'` from the disabled condition

---

## 2. Create AirplaneScroll Component

**New file:** `frontend/src/components/AirplaneScroll.tsx`

Core mechanics:
- **Image preloading:** Load all 240 frames (`ezgif-frame-001.jpg` to `ezgif-frame-240.jpg`) from `/sequence/` into an array of `HTMLImageElement` objects
- **Loading state:** Show a progress bar while frames load, only reveal the experience once complete
- **Sticky canvas:** A container with `h-[500vh]` (5x viewport for a long scroll duration) containing a `position: sticky` canvas element that stays fixed during scroll
- **Scroll-to-frame mapping:** Use `framer-motion`'s `useScroll` + `useMotionValueEvent` to map scroll progress (0-1) to frame index (0-239), drawing the corresponding frame to the canvas
- **Canvas rendering:** Draw frames using `drawImage` with `object-fit: contain` logic to keep the airplane centered and properly scaled on all screen sizes
- **Resize handling:** Listen for window resize to update canvas dimensions

### Text Overlays (The Story)
Four text sections that fade in/out based on scroll progress using `useTransform` + `motion.div`:

| Scroll % | Text | Alignment |
|----------|------|-----------|
| 0-20% | "Avicon. For all the digital aviation needs." | Center, large |
| 25-45% | "Powering 256+ Aviation Workflows." | Left |
| 50-70% | "Built for Speed. Designed for Scale." | Right |
| 80-100% | "Power Your Next Breakthrough." + CTA button | Center |

Each overlay uses opacity transforms with smooth easing for premium feel. Text has a subtle `backdrop-blur` or text-shadow glow for readability over the airplane frames.

### Styling
- Background: `#050505` (or matched to the image sequence background via eyedropper)
- Text: `text-white/90` headings, `text-white/60` body
- Font: Use existing Satoshi font with `tracking-tight`

---

## 3. Integrate into Landing Page

**File:** `frontend/src/pages/Index.tsx`
- Add `AirplaneScroll` as a lazy-loaded component
- Place it in the existing `ScrollExperience` wrapper area (replacing or placed before/after it)
- Wrap with `ScrollReveal` for consistency

---

## 4. Responsiveness
- Canvas uses `contain` fit logic so the airplane scales down on mobile
- Text overlays use responsive font sizes (`text-3xl md:text-5xl lg:text-7xl`)
- Tested for 320px to 1440px conceptually

---

## Technical Notes
- This is a Vite/React project (not Next.js), so all paths reference `/sequence/` from the `public` folder which Vite serves statically
- The 240 frames are `.jpg` format named `ezgif-frame-001.jpg` through `ezgif-frame-240.jpg`
- `framer-motion` is already installed; no new dependencies needed
- The Lenis smooth scroll provider is already active, which will make the frame interpolation even smoother

