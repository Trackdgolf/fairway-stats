

# Add "Scoring" Tab to Club Performance

## Overview
Add a third top-level view option ("Scoring") alongside "Dispersion" and "Distances". This view shows the average score relative to par when a specific club is used in a specific context (tee shot, approach, or scramble).

## Data Logic
For each hole in `hole_stats` that has both `score` and `par`:
- **Tee clubs**: Group by `tee_club`, calculate `AVG(score - par)` → e.g. "Driver: +0.42 avg over par"
- **Approach clubs**: Group by `approach_club`, calculate `AVG(score - par)` → e.g. "8 Iron: +0.15 avg over par"
- **Scramble clubs**: Group by `scramble_club` (optionally filtered by `scramble_shot_type`), calculate `AVG(score - par)`

All data already exists in the `hole_stats` table — no database changes needed.

## Changes

### 1. New hook: `useClubScoringStats`
- Queries `hole_stats` joined with `rounds` (for time filtering)
- Returns scoring averages grouped by club for each context (tee/approach/scramble)
- Supports same time range filter as dispersion
- Returns: `{ tee: [{club, avgOverPar, totalHoles}], approach: [...], scramble: [...] }`

### 2. New component: `ClubScoring.tsx`
- Sub-tabs for Tee / Approach / Scramble (reusing same tab pattern)
- Each club displayed as a card/row showing:
  - Club name
  - Average score vs par (color-coded: green for under, red for over)
  - Number of holes sampled
- Sorted by bag order, same as other views
- Time range filter included

### 3. Update `ClubPerformance.tsx`
- Add "scoring" to `TopView` type
- Add third toggle option in the `ToggleGroup`
- Render `ClubScoring` when selected

## Technical Details

| File | Change |
|------|--------|
| `src/hooks/useClubScoringStats.ts` | New hook — query hole_stats, group by club, calc avg over par |
| `src/components/ClubScoring.tsx` | New component — tabbed view showing per-club scoring averages |
| `src/pages/ClubPerformance.tsx` | Add "Scoring" to top toggle, render new component |

