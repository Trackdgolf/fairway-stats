
# Add Time Range Filter to Club Performance Page

## What Changes
A time range filter (LAST / 3M / 6M / 1Y / MAX) will be added to the Club Performance page, matching the Stats page. It will appear as a row of buttons and apply across all three tabs (Tee Shots, Approach, Scramble).

## Technical Details

### 1. `src/hooks/useDispersionStats.ts`
- Add a `timeRange` parameter (reuse the `TimeRange` type from `useRoundStats`)
- Change the query to join `hole_stats` with `rounds` via `round_id` to access `played_at`
- Apply date cutoff filtering:
  - "LAST": only include hole stats from the most recent round
  - "3M" / "6M" / "1Y": filter rounds by `played_at` date
  - "MAX": no date filter (current behavior)
- Add `timeRange` to the `queryKey` so React Query refetches on change

### 2. `src/pages/ClubPerformance.tsx`
- Add `timeRange` state, defaulting to `"MAX"`
- Add a row of time range filter buttons (LAST / 3M / 6M / 1Y / MAX) styled consistently with the Stats page
- Position the time range buttons above the club filter / scramble shot type filter
- Pass `timeRange` to `useDispersionStats`
- The time range filter is shared across all tabs -- switching tabs keeps the selected time range

### Query approach
Instead of fetching all hole_stats and filtering client-side by date, the hook will:
1. First query `rounds` filtered by `played_at` to get qualifying round IDs
2. Then query `hole_stats` filtered by those round IDs using `.in('round_id', roundIds)`
3. This keeps the existing client-side dispersion/scramble calculation logic intact
