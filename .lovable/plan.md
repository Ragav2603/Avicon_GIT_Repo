

## Plan: Integrate GlowingEffect Component + Fix Build Errors

### 1. Fix Pre-existing Build Errors

These 4 TypeScript errors must be resolved first so the project builds:

**a) `FileUploadZone.tsx`** -- Add missing `FileUploadZoneProps` interface and `MAX_SIZE` constant before the component:
```ts
const MAX_SIZE = 20 * 1024 * 1024; // 20MB

interface FileUploadZoneProps {
  folderId: string | null;
  onUploadComplete: () => void;
}
```

**b) `ContextualChat.tsx`** -- Add missing `Message` type before the component:
```ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
```

**c) `AdoptionMetricsPage.tsx`** -- Add the required `title` prop to `<PlatformLayout>`:
```tsx
<PlatformLayout title="Adoption Metrics">
```

### 2. Install `motion` NPM Dependency

The `GlowingEffect` component imports `animate` from `motion/react`. The `motion` package needs to be added to `package.json`. (Note: `framer-motion` is already installed but the component uses `motion/react` from the newer `motion` package.)

### 3. Create `frontend/src/components/ui/glowing-effect.tsx`

Copy the provided `GlowingEffect` component into the shadcn UI directory. The component:
- Uses `motion/react` for smooth angle animations
- Tracks pointer position to create a directional glow border effect
- Accepts props for blur, spread, proximity, variant, etc.
- Uses CSS custom properties (`--start`, `--active`, `--blur`, `--spread`) for the conic-gradient glow

No modifications needed beyond removing the `"use client"` directive (not needed in Vite/React).

### 4. Summary of Files Changed

| File | Action |
|------|--------|
| `frontend/src/components/ui/glowing-effect.tsx` | Create new component |
| `frontend/src/components/platform/knowledge-base/FileUploadZone.tsx` | Add missing interface + constant |
| `frontend/src/components/platform/ai-chat/ContextualChat.tsx` | Add missing `Message` interface |
| `frontend/src/pages/platform/AdoptionMetricsPage.tsx` | Add `title` prop to `PlatformLayout` |
| `package.json` | Add `motion` dependency |

