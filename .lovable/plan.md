

# Add Scramble-Specific Recent Rounds View

## Overview
On the individual hole detail page (Courses → Hole), make the "Recent Rounds" list context-aware so it matches whichever dispersion tab is active:
- **Tee Shot tab** → existing card (date, score, tee club, hit/miss direction)
- **Scramble tab** → new card showing scramble-specific data (club, miss direction, score, shot type, up & down result)

## Behavior

The "Recent Rounds" section listens to the active tab in `HoleDetail.tsx`. When the user toggles to **Scramble**, the list filters to plays that were actual scramble attempts (`gir === false` AND `scramble` is `"yes"` or `"no"`) and renders a different card layout. When on **Tee Shot**, the list keeps the current behaviour and shows all recorded plays.

If the user is on the Scramble tab and no scramble attempts exist for this hole, show: *"No scramble attempts recorded for this hole yet."*

## Scramble Card Layout

Each scramble row shows:

```text
[ Date ]                                  [ Score  Label ]
🏌  Club: Sand Wedge     📍 From: Left     ⛳ Type: Bunker
✅ Up & Down: Yes
```

Fields per row (sourced from `HolePlay`):
- **Date** — `playedAt` (existing format)
- **Score / label** — same colored score + label as today
- **Club** — `scrambleClub` (new field, see below). Falls back to "—" if not recorded.
- **From** — `girDirection` capitalized (Left / Right / Short / Long)
- **Type** — `scrambleShotType` capitalized (Pitch / Chip / Bunker), "—" if missing
- **Up & Down** — Green check + "Yes" when `scramble === "yes"`, red X + "No" when `"no"`

## Data Layer

`hole_stats` already stores `scramble_club` and `scramble_shot_type` (confirmed in schema). `useHoleHistory` currently doesn't expose them, so:

1. Add `scrambleClub` and `scrambleShotType` to the `HolePlay` interface.
2. Extend the `select(...)` in `useHoleHistory.ts` to include `scramble_club, scramble_shot_type`.
3. Map them in the returned object (same for par-3 and longer holes — no special remap needed).

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useHoleHistory.ts` | Add `scrambleClub` + `scrambleShotType` to `HolePlay` and select/map them |
| `src/components/HoleDetail.tsx` | Lift active tab into state; render either the existing tee-shot list or the new scramble list based on active tab; add empty state for scramble |

## Technical Notes

- No DB migration needed — fields already exist on `hole_stats`.
- Reuse `getScoreColor` / `getScoreLabel` helpers already in `HoleDetail.tsx`.
- Use `lucide-react` icons already in use (`Check`, `X`, `MapPin`, `Flag` or similar) for the scramble row to stay visually consistent.
- Keep the section title as "Recent Rounds" on both tabs; only the row contents change.

