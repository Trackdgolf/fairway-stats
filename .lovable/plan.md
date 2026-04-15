

# Home Page: Collapsible Recent Rounds + Streak Tracker Tiles

## Overview
Two changes: (1) wrap Recent Rounds in a collapsible section, and (2) add two "days since accident" style streak cards below the handicap card.

## 1. Collapsible Recent Rounds
Wrap the existing Recent Rounds section with the `Collapsible` component (already available). Default to collapsed. Show a header row with "Recent Rounds" and a chevron that toggles open/closed.

## 2. Streak Tracker Tiles

### Data Query
Create a new hook `useStreakTrackers` that queries `hole_stats` joined through `rounds` for the current user, ordered by `rounds.played_at` DESC and `hole_stats.hole_number` DESC (most recent hole first). The query fetches `score`, `par`, and `putts` for all holes.

### Logic
- **3-Putt streak**: Walk holes from most recent backward. Count consecutive holes where `putts < 3` (or putts is null — skip). When `putts >= 3` is found, stop counting. That's the current streak.
- **Double bogey+ streak**: Same approach. A double bogey or worse = `score >= par + 2`. Count consecutive holes where this is NOT the case.
- **Longest streak**: For each metric, also scan the full history to find the longest run without the event.

### UI
Two side-by-side cards below the handicap card, styled like a workplace safety sign:
- Large number showing current streak (holes count)
- Label: "Holes since last 3-putt" / "Holes since last double bogey+"
- Smaller text: "Longest: X holes"
- Icon: a shield or hard-hat style icon to play on the "days since accident" theme

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useStreakTrackers.ts` | New hook — queries hole_stats via rounds, computes current + longest streaks for 3-putts and double bogeys |
| `src/pages/Home.tsx` | Import Collapsible components, wrap Recent Rounds section; import and render streak tiles below handicap card |

## Technical Details
- The hook uses `getSupabaseClient()` per project convention
- Query: `rounds` with `hole_stats(hole_number, score, par, putts)` ordered by `played_at desc`, then `hole_number desc`
- Collapsible defaults to `open={false}` with a `ChevronDown` toggle icon
- Streak cards use the existing `Card` component with a 2-column grid layout

