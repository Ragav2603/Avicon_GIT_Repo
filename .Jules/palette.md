## 2024-05-22 - Custom Focus Rings
**Learning:** Removing default outlines (`focus:outline-none`) harms keyboard accessibility.
**Action:** Always replace with `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` when building custom interactive elements to match the design system while maintaining accessibility.

## 2025-02-18 - Form Validation Accessibility
**Learning:** Visual error messages and red borders are insufficient for screen reader users. Inputs must explicitly link to error messages.
**Action:** Always verify that inputs with validation errors have `aria-invalid="true"` and `aria-describedby` pointing to the error message ID.
