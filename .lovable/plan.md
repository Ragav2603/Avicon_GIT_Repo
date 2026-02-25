
## Changes Overview

This plan covers four visual updates to the landing page:

---

### 1. Trusted Partners Marquee -- Show Actual Logos

The logos already exist in `/public/logos/` and the `TrustedPartnersMarquee` component already references them. The images render with `grayscale opacity-60` styling but they should be showing. The likely issue is that the logo images are too small or the grayscale makes them invisible. We will increase the logo image container from `w-10 h-10` / `h-8 w-8` to `w-16 h-16` / `h-14 w-14` and remove the grayscale filter so logos display prominently in full color.

**File:** `frontend/src/components/TrustedPartnersMarquee.tsx`
- Increase logo container size from `w-10 h-10` to `w-16 h-16`
- Increase image size from `h-8 w-8` to `h-14 w-14`
- Remove `grayscale opacity-60` classes so logos show in full color at all times

---

### 2. Change "New RFP Generated" and "Draft Response Ready" Colors to Green/Blue

**File:** `frontend/src/components/AIDocumentIntel.tsx`

- **"New RFP Generated / Ready to publish"** (Airlines flow): Change from `accent` (orange) styling to `primary` (blue) -- classes like `bg-primary/10`, `border-primary/30`, `text-primary`, `bg-primary/30`
- **"Draft Response Ready / Pre-filled & scored"** (Vendors flow): Change from `warning` (amber) styling to `success` (green) -- classes like `bg-success/10`, `border-success/30`, `text-success`, `bg-success/30`

---

### 3. Change Extraction Count from 228 to 146

**File:** `frontend/src/components/AIExtractionShowcase.tsx`
- Change the text from `EXTRACTING 228 QUESTIONS ...` to `EXTRACTING 146 QUESTIONS ...`

---

### 4. Double the AviCon Logo Size in Header and Footer

**File:** `frontend/src/components/Logo.tsx`
- Current sizes: `sm: h-10` (40px), `md: h-[42px]`, `lg: h-16` (64px)
- New doubled sizes: `sm: h-20` (80px), `md: h-[84px]`, `lg: h-32` (128px)

**File:** `frontend/src/components/Navbar.tsx`
- The navbar height is currently `h-16` (64px). With a doubled logo (~84px), increase navbar height to `h-24` (96px) to accommodate the larger logo.

---

### Technical Details

All changes are CSS class swaps and a single string edit -- no new dependencies or structural changes required. Four files modified total:
- `frontend/src/components/TrustedPartnersMarquee.tsx`
- `frontend/src/components/AIDocumentIntel.tsx`
- `frontend/src/components/AIExtractionShowcase.tsx`
- `frontend/src/components/Logo.tsx`
- `frontend/src/components/Navbar.tsx`
