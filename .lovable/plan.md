## Change Putt Outcome Counts to Percentages

### What
On the Club Performance page, Putting tab, replace raw count labels under each distance bucket (e.g. "Short 2", "Long 1") with percentage labels (e.g. "Short 25%", "Long 10%").

### Where
`src/components/PuttingPerformance.tsx` — the outcome breakdown row inside each bucket card (lines 81-88).

### How
Update the label rendering for each outcome to compute `(count / bucket.total) * 100`, round to the nearest whole number, and display as a percentage instead of the raw count. The visual bar segments (OutcomeBar) already use percentages for widths; only the text labels beneath the bars need changing.

### Example
Before: `Short 2`  
After: `Short 25%`

### Files to edit
- `src/components/PuttingPerformance.tsx`
