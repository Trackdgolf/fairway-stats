

# Add Scramble % Tab to Hole Detail

## Overview
On the Courses page, when viewing an individual hole, add a tabbed view so users can toggle between two visual analyses:
1. **Tee Shot** (existing) — Avg score by tee shot outcome
2. **Scramble** (new) — Up-and-down % by missed-green location

Both use the same green/fairway image overlay pattern, so misses left / right / short / long show the user's scramble success rate from that side of the green.

## Behavior

A scramble attempt = a hole where GIR was missed (`gir = false`) and the user recorded a `scramble` value of `"yes"` or `"no"`. Holes with `scramble = null` (no attempt logged) are excluded.

Up-and-down % per direction = `count(scramble === "yes") / count(scramble in ["yes","no"]) * 100`, grouped by `gir_direction` (`left`, `right`, `short`, `long`). For par 3s, this works the same way (tee shot = approach shot, already mapped in the hook). Penalty holes are excluded from scramble stats.

Color thresholds for the % label (matches existing visual language):
- ≥ 60% → green
- 40–59% → yellow
- 20–39% → orange
- < 20% → red
- No data for that direction → label hidden

If no scramble attempts exist for the hole at all → show a centered empty-state message: "No scramble attempts recorded for this hole yet."

## UI

Inside `HoleDetail.tsx`, replace the single `TeeOutcomeDispersion` block with a shadcn `Tabs` component:

```text
[ Tee Shot ] [ Scramble ]
─────────────────────────
   <green/fairway image with overlay labels>
```

Tabs sit directly under the summary card, above "Recent Rounds". Default tab is **Tee Shot**.

The new Scramble overlay always uses `green-dispersion.png` (since scrambling happens around the green) regardless of par. Labels show `"65%"` style values plus a small `"U&D"` sublabel, positioned at the same left/right/short/long anchors used by `TeeOutcomeDispersion`.

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useHoleHistory.ts` | Add `gir`, `girDirection`, `scramble` fields to `HolePlay` (already partly selected; just expose them, including for par-4/5 from `gir`/`gir_direction`) |
| `src/components/ScrambleOutcomeDispersion.tsx` | **NEW** — mirrors `TeeOutcomeDispersion` structure but groups by `girDirection` and computes U&D % from `scramble` field; always uses green image |
| `src/components/HoleDetail.tsx` | Wrap the dispersion section in `Tabs` with two `TabsContent` panels (Tee Shot, Scramble) |

## Technical Notes

- No DB schema or migrations needed — `hole_stats.scramble`, `gir`, and `gir_direction` already exist.
- `useHoleHistory` already selects `gir` and `gir_direction`; we just need to expose them on the `HolePlay` type and stop overwriting them with par-3 logic for the scramble case (par 3 misses still map cleanly because `gir`/`gir_direction` is recorded for par 3s too).
- New component reuses the `DispersionLabel` visual style (black pill, colored value, tiny uppercase sublabel).
- `Tabs` component is already in the project (`@/components/ui/tabs`).

