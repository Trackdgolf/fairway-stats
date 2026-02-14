

## Fix: Courses Page Header Spacing

The content area currently uses `pt-6` for top padding, which causes it to overlap with the `PageHeader` banner. Other pages in the app use `pt-20` to properly clear the header.

### Change

**File: `src/pages/Courses.tsx` (line 39)**

Update the top padding from `pt-6` to `pt-20` to match the standard layout used across all other pages (Home, Stats, Clubs, Settings).

```
// Before
<div className="relative z-10 px-4 pt-6">

// After
<div className="relative z-10 px-4 pt-20">
```

Also update `pb-20` to `pb-24` on the outer wrapper (line 37) to match the safe-area spacing convention used on other pages.

### Files Modified
- `src/pages/Courses.tsx` -- two class name adjustments

