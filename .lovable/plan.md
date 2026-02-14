

## Fix: Courses Page Header Spacing

The header text is positioned too low because the content container uses `pt-20` while the Stats and Clubs pages use `pt-8`. This pushes the title and subtitle below the green banner instead of inside it.

### Change

**File: `src/pages/Courses.tsx`**

Two adjustments:

1. **Line 37** -- Update the outer wrapper to use the same gradient background and safe-area padding as Stats and Clubs:
   - Change `min-h-screen bg-background pb-24` to `min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative` with the safe-area style.

2. **Line 39** -- Change the content container from `px-4 pt-20` to `max-w-md mx-auto px-4 pt-8` to match Stats and Clubs pages exactly. This moves the title and subtitle up into the green banner area.

```tsx
// Before (line 37-39)
<div className="min-h-screen bg-background pb-24">
  <PageHeader />
  <div className="relative z-10 px-4 pt-20">

// After
<div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
  <PageHeader />
  <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
```

This matches the exact structure used by the Stats page (`pt-8`, `max-w-md mx-auto`, gradient background, safe-area padding), ensuring the "Courses" title and subtitle sit inside the green header banner.
