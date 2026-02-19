

# Add Partner Logos to Trusted Partners Marquee

## Overview
Replace the letter-initial placeholders in the marquee with actual company logos, sourced from public logo CDNs (SVG format for crisp rendering at any size).

## Approach
Use publicly available logo URLs from established logo CDNs (e.g., `logo.clearbit.com` or `companieslogo.com`). Each logo will be rendered as a grayscale `img` tag with a hover-to-color effect, which is the standard enterprise "trusted by" pattern.

## Changes

### `src/components/TrustedPartnersMarquee.tsx`

**1. Update the `partners` array** to include a `logo` URL for each company using Clearbit's logo API (`https://logo.clearbit.com/:domain`):

| Partner           | Domain                    |
|-------------------|---------------------------|
| Emirates          | emirates.com              |
| Lufthansa         | lufthansa.com             |
| Singapore Airlines| singaporeair.com          |
| Qatar Airways     | qatarairways.com          |
| British Airways   | britishairways.com        |
| Delta             | delta.com                 |
| Amadeus           | amadeus.com               |
| SITA              | sita.aero                 |
| Sabre             | sabre.com                 |
| Collins Aerospace | collinsaerospace.com      |

**2. Replace the letter-initial `div`** (lines 35-38) with an `img` element:
- Size: `h-8 w-auto` (32px height, auto width to preserve aspect ratio)
- Style: `grayscale opacity-60` by default, full color on parent hover via group hover utilities
- Fallback: Keep the letter initial as a fallback if the image fails to load (using `onError` handler to hide the image and show the letter)

**3. Simplify the partner display** -- remove the "type" subtitle line (airline/vendor) since the logos make the companies self-explanatory. Keep only the company name text beside the logo.

**4. Add grayscale-to-color hover effect** using Tailwind's `group` utility:
- Parent div gets `group` class
- Image gets `grayscale group-hover:grayscale-0 opacity-60 group-hover:opacity-100 transition-all duration-300`

## Result
The marquee will show recognizable company logos scrolling horizontally in grayscale, with each logo becoming full-color on hover. The gradient edge masks and hover-pause behavior remain unchanged.

## Technical Notes
- Clearbit Logo API is free and widely used for this exact purpose
- No new dependencies or assets needed -- logos load from CDN
- SVG/PNG logos from Clearbit are typically 128x128, scaled down to 32px height
- `onError` fallback ensures graceful degradation if any logo URL fails

