

# Add Progress Indicator to Streak Tiles

## Overview
Add a small visual progress bar to each streak tile on the Home page showing how close the current streak is to the user's longest (record) streak. This adds a "chasing your record" feel and makes the tiles more visually engaging.

## Behavior

- **Progress %** = `current / longest * 100` (capped at 100%).
- **When `longest === 0`**: hide the bar entirely (no record yet, nothing to chase).
- **When `current >= longest && longest > 0`**: show the bar at 100% with a celebratory accent color (using the brand vibrant green / `text-primary`) and replace "Longest: X" with "🏆 New record!" text.
- **Otherwise**: bar fills proportionally in the standard accent color.

## UI Details

Add a thin (`h-1.5`) rounded progress bar between the current streak number and the "Longest:" label inside each card. Use the existing shadcn `Progress` component (`@/components/ui/progress`) which already supports a `value` prop.

Layout per tile (top → bottom):
1. Icon
2. Large current number
3. Label ("Holes since last 3-putt", etc.)
4. **NEW: Thin progress bar** (hidden when `longest === 0`)
5. "Longest: X" text — or "🏆 New record!" when at/above longest

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Import `Progress` from `@/components/ui/progress`; add a small progress bar + record-state logic to each of the 3 streak `Card`s |

## Technical Notes
- No data layer changes — `useStreakTrackers` already returns both `current` and `longest`.
- `Progress` component is already available in the project (`src/components/ui/progress.tsx`).
- A small helper inline (e.g., `const pct = longest > 0 ? Math.min(100, (current / longest) * 100) : 0`) keeps the JSX readable without a new component.

