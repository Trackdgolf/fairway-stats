

# Add "Holes Since Last Penalty" Streak Tile

## Overview
Add a third streak tracker tile to the Home page, alongside the existing "3-putt" and "double bogey+" tiles, that tracks holes played since the user last recorded a penalty shot.

## Changes

### 1. `src/hooks/useStreakTrackers.ts`
- Extend the query to also select `penalties` from `hole_stats`.
- Add a third `calcStreak` calculation: a hole is a "bad event" when `penalties != null && penalties > 0`. Holes with `penalties == null` are skipped.
- Return a new `penalty: { current, longest }` object alongside `threePutt` and `doubleBogey`.
- Update the `StreakData` interface and the default fallback values.

### 2. `src/pages/Home.tsx`
- Change the streak tile grid from `grid-cols-2` to `grid-cols-3` so all three tiles fit on one line.
- Add a third `Card` for "Holes since last penalty" using the `AlertTriangle` icon (imported from `lucide-react`) to differentiate it from the existing shield icons.
- Tighten internal padding/text sizes slightly if needed so three cards read cleanly on narrow mobile widths (the existing labels are already short; `text-xs` labels and `text-3xl` numbers should still fit).

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useStreakTrackers.ts` | Add `penalties` to query + third streak calculation |
| `src/pages/Home.tsx` | Grid → 3 columns, render third tile with `AlertTriangle` icon |

