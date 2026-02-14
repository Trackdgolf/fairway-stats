

## Relative Color Scaling for +/- Column

### The Problem

The current color system uses fixed thresholds (e.g., > +1.0 = red). A higher handicap golfer who averages +1.5 per hole would see every single hole in red, making the colors meaningless.

### The Solution

Color each hole relative to **the player's own performance across that course**. Their best holes are green, worst holes are red, and the rest fall in between. This makes the colors meaningful for a scratch golfer and a 30-handicapper alike.

### How It Works

Instead of comparing each hole's +/- against fixed numbers, we compare it against the player's own range for that course:

- Find the player's best and worst avg over par across all 18 holes
- Calculate where each hole falls within that range (as a percentage)
- Apply colors based on that percentage:
  - **Bottom 20%** (their best holes): Green
  - **20-40%**: Yellow
  - **40-60%**: Light orange
  - **60-80%**: Dark orange
  - **Top 20%** (their worst holes): Red

For example, if a player's holes range from +0.8 to +2.5, a hole at +1.0 would be green (near their best), while +2.3 would be red (near their worst). The same logic works for a scratch player ranging from -0.5 to +0.8.

### Technical Details

**File: `src/pages/Courses.tsx`**

1. Replace the current `getOverParColor(val: number)` function with a new version that accepts the min and max of the player's range:

```tsx
const getOverParColor = (val: number, min: number, max: number) => {
  if (min === max) return "text-yellow-500";
  const pct = (val - min) / (max - min);
  if (pct <= 0.2) return "text-green-500";
  if (pct <= 0.4) return "text-yellow-500";
  if (pct <= 0.6) return "text-orange-400";
  if (pct <= 0.8) return "text-orange-500";
  return "text-red-500";
};
```

2. Calculate `min` and `max` from the selected course's holes before rendering:

```tsx
const holeMin = Math.min(...selectedCourse.holes.map(h => h.avgOverPar));
const holeMax = Math.max(...selectedCourse.holes.map(h => h.avgOverPar));
```

3. Update all calls to `getOverParColor` in the detail view to pass `min` and `max` -- this includes the hole table rows and the Front 9 / Back 9 summary card.

The Front 9 / Back 9 summary will use the per-hole average range so colors remain consistent across the page.

No changes to the course list view or the hook -- this is purely a display change within the detail view.

