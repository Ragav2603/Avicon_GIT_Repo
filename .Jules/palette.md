## 2024-05-22 - Custom Focus Rings
**Learning:** Removing default outlines (`focus:outline-none`) harms keyboard accessibility.
**Action:** Always replace with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` when building custom interactive elements to match the design system while maintaining accessibility.

## 2025-02-18 - Form Validation Accessibility
**Learning:** Visual error messages and red borders are insufficient for screen reader users. Inputs must explicitly link to error messages.
**Action:** Always verify that inputs with validation errors have `aria-invalid="true"` and `aria-describedby` pointing to the error message ID.

## 2026-02-18 - Dynamic Form Accessibility
**Learning:** Dynamic lists in React forms (like adding multiple requirements) often break accessibility because inputs lack unique IDs and labels, making them invisible or confusing to screen reader users.
**Action:** Always generate unique IDs using the index (e.g., `id={`field-${index}`}`) and associate them with labels using `htmlFor`, and add specific `aria-label`s to inputs that don't have visible labels or rely on placeholders.

## 2026-02-18 - Keyboard Accessible File Uploads
**Learning:** Custom file upload dropzones implemented as clickable `div`s are completely invisible to keyboard users and screen readers unless explicitly made interactive.
**Action:** Always add `role="button"`, `tabIndex={0}`, `aria-label`, and `onKeyDown` (for Enter/Space) to any non-interactive element (like a `div`) that triggers an action, along with `focus-visible` styles.
