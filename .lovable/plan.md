
## Status: Edge Function is Already Working

Good news — the `generate-draft` edge function does **not** need to be redeployed. The logs confirm it is running correctly:

- Two successful PDF extractions at 17:09 and 17:10 today
- 12 and 8 requirements were extracted and returned to the frontend

The actual problem is a **wiring bug in `AirlineDashboard.tsx`** that causes extracted data to be silently discarded before reaching the wizard.

---

## Root Cause: Data is Dropped Between Components

```text
SmartRFPCreator  ──onAICreate(extractedData)──►  AirlineDashboard.handleAICreate()
                                                         │
                                                   [DATA DROPPED]
                                                         │
                                                  CreateProjectWizard
                                                  (receives no prefillData)
```

### Bug 1 — `handleAICreate` ignores its argument

Current code in `AirlineDashboard.tsx` (line 58):
```typescript
const handleAICreate = () => {        // <-- no parameter
  setShowSmartCreator(false);
  setShowProjectWizard(true);
  // extractedData is never set
};
```

It should be:
```typescript
const handleAICreate = (data: ExtractedData) => {
  setExtractedData(data);            // store the AI result
  setShowSmartCreator(false);
  setShowProjectWizard(true);
};
```

### Bug 2 — `CreateProjectWizard` never receives `prefillData`

Current code (line 268):
```typescript
<CreateProjectWizard
  open={showProjectWizard}
  onOpenChange={setShowProjectWizard}
  // prefillData is missing!
/>
```

It should be:
```typescript
<CreateProjectWizard
  open={showProjectWizard}
  onOpenChange={setShowProjectWizard}
  prefillData={extractedData}
  onSuccess={() => setExtractedData(null)}
/>
```

---

## What the Fix Restores

`CreateProjectWizard` already has full prefill logic (lines 70–101) that:
1. Sets the title from `prefillData.title`
2. Maps mandatory requirements → Deal Breakers
3. Maps non-mandatory requirements → Adoption Goals
4. Skips the template selector and jumps directly to Step 2 (Details)

This logic works correctly — it just never receives data because of the dashboard bug.

---

## Technical Changes

**File: `src/pages/AirlineDashboard.tsx`**

1. Update `handleAICreate` to accept and store the `ExtractedData` argument
2. Pass `prefillData={extractedData}` to `<CreateProjectWizard>`
3. Clear `extractedData` via `onSuccess` so subsequent manual creations start fresh
