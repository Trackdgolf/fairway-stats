

## Add "Average Penalties" Stat + Move "Total Rounds" to Text

### Summary
Replace the "Total Rounds" stat tile with a new "Average Penalties" tile (using the `AlertTriangle`/exclamation icon), make it chartable like other stats, and display total rounds as a text line below the time range buttons.

### Changes

**1. `src/hooks/useRoundStats.ts` -- Add penalties data**
- Add `avgPenalties: number | null` to `RoundStats` interface
- Add `avgPenalties: ChartDataPoint[]` to `TimeSeriesData` interface
- In the aggregate calculation, compute average penalties per round by summing `hole.penalties` across all holes per round and averaging across rounds
- In the per-round time series loop, sum penalties for each round and push to `timeSeries.avgPenalties`
- Include `avgPenalties` in the empty/default return objects

**2. `src/pages/Stats.tsx` -- Replace tile + add text line**
- Add `AlertTriangle` to the lucide-react import (exclamation mark triangle icon)
- Add `"avgPenalties"` to the `StatType` union
- Add `"avgPenalties"` to the `PREMIUM_STATS` array (keep it premium-gated)
- In `getChartData()`, map `avgPenalties` to `data.timeSeries.avgPenalties`
- In `getChartTitle()`, add `avgPenalties: "Avg Penalties Over Time"`
- Replace the `totalRounds` entry in `allStats` with a new `avgPenalties` entry:
  - icon: `AlertTriangle`
  - value: formatted from `data?.stats?.avgPenalties`
  - label: "Avg Penalties"
  - isSelectable: true (charts when clicked)
  - iconColor: `bg-amber-100 dark:bg-amber-900/30`, iconTextColor: `text-amber-500`
- After the time range buttons `div` and before the stat tiles grid, add a text line:
  ```
  <p className="text-sm text-muted-foreground mb-4">
    Total Rounds: {data?.stats?.totalRounds || 0}
  </p>
  ```

### Technical Details

**Penalties calculation in `useRoundStats`:**
```
// Per round: sum of all hole penalties
// Aggregate: average of per-round totals

roundHoleStats penalties sum -> per round value
Average across all rounds -> aggregate avgPenalties
```

The stat tile grid stays 2x4 (8 tiles): Best Score, Avg Score, Avg Over Par, Avg Putts, Avg Penalties, FIR%, GIR%, Scramble%.

