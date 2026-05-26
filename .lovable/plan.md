
## Goal
Replace the "Putting green graphic — coming soon" placeholder in `src/components/PuttingPerformance.tsx` with a dynamic horizontal bar chart that shows outcome percentages (Holed, Short, Long, Left, Right, Lip out). By default it aggregates all putts; tapping a distance tile (0–3 ft, 4–8 ft, 9–14 ft, 15 ft+) filters the chart to that bucket. Tapping the active tile again (or an "All" pill) returns to the aggregate view.

## UX

- Card at top contains:
  - Header row: title "Outcome breakdown" + small badge showing current scope ("All putts" or "4–8 ft") with total attempts count.
  - Horizontal bar chart, one row per outcome, each row: label on left, filled bar (width = % of selected scope), percentage on right.
  - Outcomes always rendered in fixed order: Holed, Lip out, Short, Long, Left, Right. Rows with 0% still render (greyed) so the chart doesn't jump in height.
  - Empty state: if scope total is 0, show "No putts recorded in this range yet."
- Distance tiles below become tappable:
  - Active tile gets a primary ring/border + subtle bg tint.
  - Tapping the active tile clears the filter (back to All).
  - Add visual affordance: `cursor-pointer`, `aria-pressed`, keyboard activatable (button wrapper).

## Technical details

File: `src/components/PuttingPerformance.tsx`

1. Add `const [selectedBucket, setSelectedBucket] = useState<PuttDistanceBucket | null>(null);`
2. Derive `activeStats`:
   - If `selectedBucket` is null → aggregate across `stats.buckets` (sum totals + each outcome).
   - Else → the matching bucket from `stats.buckets`.
3. New `OutcomeBreakdown` subcomponent renders the 6 outcome rows using Tailwind divs (no recharts needed — keeps bundle light and matches existing OutcomeBar styling). Colors reuse existing tokens: `bg-primary` (Holed), `bg-yellow-500` (Lip out), `bg-muted-foreground/60..30` (Short/Long/Left/Right).
4. Replace the placeholder Card body with the chart. Keep the same Card wrapper for visual consistency.
5. Wrap each bucket tile in a `<button type="button">` with `onClick={() => setSelectedBucket(prev => prev === b.bucket ? null : b.bucket)}` and `aria-pressed={selectedBucket === b.bucket}`. Add ring styling when active.
6. No changes to `usePuttingStats` — all data already available.

## Out of scope
- No backend / hook changes.
- No new dependency (no Recharts) — simple div-based bars match current style.
