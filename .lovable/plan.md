

## Fix Y-Axis Scaling on Stats Chart

### The Problem

The `getYAxisDomain` function always starts the Y-axis at 0 for positive values (line 58). This works for stats like "Avg Over Par" (which can be negative) and "Scramble%" (which might range near 0), but creates massive dead space for stats like GIR% (40-65%), Avg Score (75-95), and FIR% (30-70%).

### The Fix

**File: `src/components/StatsChart.tsx`**

Replace the `getYAxisDomain` function with logic that pads both the min and max based on the actual data range, rather than forcing min to 0:

```tsx
const getYAxisDomain = (): [number, number] => {
  if (!data || data.length === 0) return [0, 10];

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal;

  // Pick a nice tick interval based on the spread
  let interval = 1;
  if (range > 50) interval = 10;
  else if (range > 20) interval = 5;
  else if (range > 10) interval = 2;

  // If all values are the same, pad symmetrically
  if (range === 0) {
    return [
      Math.floor(minVal / interval) * interval - interval,
      Math.ceil(maxVal / interval) * interval + interval,
    ];
  }

  // Pad one interval below the min and one above the max
  const paddedMin = Math.floor(minVal / interval) * interval - interval;
  const paddedMax = Math.ceil(maxVal / interval) * interval + interval;

  // Don't go below 0 for percentage or score stats (never negative)
  return [Math.max(paddedMin, 0), paddedMax];
};
```

Key changes:
- The min is now calculated from the actual data, not forced to 0
- Both ends get one interval of padding so data points never sit on the edge
- A `Math.max(paddedMin, 0)` guard still prevents negative Y-axis values for stats that can't be negative (scores, percentages, putts)
- "Avg Over Par" still works correctly because its values can be negative, so the guard won't kick in

This is a single function change in one file. No other files need updating.
