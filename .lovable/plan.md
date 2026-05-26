## Root cause of the horizontal scroll

The screenshot shows the card itself rendering far wider than the dialog (course name, total score and BACK 9 column are pushed off-screen to the right). Two things in the current `ScorecardSlide` cause this:

1. **`truncate` on the course name without a width-constrained ancestor.** `truncate` adds `white-space: nowrap`. With no definite width on its parent chain, the long course name forces the parent (and the card) to grow as wide as the text. That single nowrap element widens the whole green card past the dialog.
2. **`flex-1` on the two `Nine` columns without `min-w-0` actually applied to the inner grids.** The intrinsic min-content of the score pill / labels can push each column wider than half the slide, so the back-9 column gets shoved off-screen.

The dialog has `max-w-sm` but no `overflow-x-hidden`, so when a child sets a wider min-content the dialog visually allows the content to bleed past the right edge — exactly what the screenshot shows.

## Fix — single vertical column scorecard, hard-clipped to slide width

Drop the two-column "Front 9 | Back 9" idea. Use **one full-width column listing all 18 holes top-to-bottom**, with section dividers for Front/Back nines. This eliminates any side-by-side width pressure and makes the whole card naturally narrow.

### Layout

```text
+----------------------------+
|        TRACKD logo         |
|        Course name         |   (wraps to 2 lines, no truncate)
|        26 May 2026         |
|         84   +12           |
+----------------------------+
| FRONT 9                    |
| Hole   Par   SI   Score    |
|  1      4     7     5      |
|  2      5     3     6      |
|  ...                       |
|  9      4    15     4      |
| OUT    36          42      |
+----------------------------+
| BACK 9                     |
| 10     4     2     4       |
|  ...                       |
| 18     5     6     6       |
| IN     36          41      |
+----------------------------+
|  TOTAL  Par 72   83 (+11)  |
+----------------------------+
|     SI = Stroke Index      |
+----------------------------+
```

### Implementation in `src/components/RoundSummaryModal.tsx`

- **Header block**: remove `truncate` from the course name; allow it to wrap to two lines (`text-sm font-bold leading-tight break-words`). Logo `h-8`, date `text-[10px]`, total + diff inline.
- **Single column**: each hole = one row, 4 sub-columns, full slide width.
  - Use `grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)]` (NOT bare `fr`) so columns can shrink to fit.
  - Row classes: `text-[11px] bg-white/5 rounded px-2 py-[3px] tabular-nums`. Hole #, Par, SI all center; Score cell uses existing `scoreCellClass()` color coding.
  - Row height ~22 px → 18 rows ≈ 400 px, plus headers/totals/footer ≈ 540 px total. Fits within a 9:16 share-card ratio comfortably.
- **Nine sections**: small uppercase header (`FRONT 9`, `BACK 9`) above each block; OUT/IN total row at bottom of each block using same 4-column grid (`bg-white/15`, `font-bold`).
- **Total row** below both nines: `Total · Par 72 · 83 +12`.
- **Footer**: `SI = Stroke Index` muted line.

### Guarantee the card never overflows horizontally

- On the green slide wrapper (`<div ref={scorecardRef} className="rounded-2xl overflow-hidden">`) keep `overflow-hidden` (it already is) and add `w-full`.
- On the `ScorecardSlide` root, add `w-full max-w-full overflow-hidden`.
- On the DialogContent in this modal only, add `overflow-x-hidden` alongside existing `overflow-y-auto` as a belt-and-braces guard so any future widening of a child can never push the dialog past `max-w-sm`.

## Files touched

- `src/components/RoundSummaryModal.tsx` only
  - Rewrite `ScorecardSlide` to the single-column vertical layout above (no two-column flex, no `truncate`, all columns use `minmax(0,1fr)`).
  - Add `overflow-x-hidden` to the `DialogContent` className and `w-full` to the scorecard wrapper.
- No DB, no other components, no logic changes.

## Verification

After the edit I will check the rendered modal at the user's 390×803 viewport with a screenshot to confirm:
- No horizontal scroll on the dialog or the card.
- All 18 holes, both nine totals, and the total row are visible.
- Course name wraps cleanly instead of being clipped.
