

## Add "Last Round" Time Filter to Stats Page

### What It Does

Adds a new "LAST" button alongside the existing 3M / 6M / 1Y / MAX time range buttons. When selected, it filters all stats to show only the data from your most recent round. The chart will display a single data point, and all stat tiles will reflect that one round's performance.

### How It Works

Since the stats are already calculated per-round in the `useRoundStats` hook, we just need to:

1. Add a new time range option "LAST" that fetches all rounds but then slices down to only the most recent one
2. The stat tiles will show that single round's numbers instead of averages
3. The chart will show a single point (or be hidden/replaced with a summary since one point doesn't make a trend line)

### Technical Details

**File: `src/hooks/useRoundStats.ts`**

- Add `"LAST"` to the `TimeRange` type: `"3M" | "6M" | "1Y" | "MAX" | "LAST"`
- When `timeRange === "LAST"`, fetch all rounds (no date cutoff), then after the query returns, slice to keep only the most recent round (last by `played_at`)
- All downstream stat calculations (FIR%, GIR%, putts, etc.) will naturally work since they already operate on whatever rounds are in the filtered set

**File: `src/pages/Stats.tsx`**

- Update the `TimeRange` type to include `"LAST"`
- Add a "LAST" button to the time range button group (renders alongside 3M, 6M, 1Y, MAX)
- The chart and stat tiles will automatically reflect the single-round data since they consume the same hook output

No changes needed to `StatsChart.tsx` or `StatTile.tsx` -- they already handle any number of data points including one.
