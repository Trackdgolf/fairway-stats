## Root cause of the scrolling

Two compounding issues:

1. **Carousel forces all slides to the tallest slide's height.** Embla's slide container in `src/components/ui/carousel.tsx` is `flex` with default `align-items: stretch`. So when the scorecard slide grew, the original two share cards stretched to match it — that is why slides 1 and 2 now also scroll, even though their own content did not change.

2. **The horizontal 18-column scorecard is fundamentally too wide for a 390 px viewport** inside a `max-w-sm` (~384 px) dialog with side padding. Even with `minmax(0,1fr)` cells, the typography and per-cell padding leave the card taller than the visible area inside the dialog's `max-h-[90vh]`.

## Fix

### 1. Stop the carousel from equalising slide heights

Pass `className="items-start"` to the `<CarouselContent>` in `RoundSummaryModal.tsx`. This overrides the default flex stretch so each slide's height is independent. Result: slides 1 and 2 return to their original (non-scrolling) height regardless of how tall the scorecard slide is.

### 2. Rebuild the Scorecard slide as a vertical, two-column layout

Replace the horizontal 18-cell grid with a **two-column** layout — Front 9 on the left, Back 9 on the right. Each column is a narrow stack of 9 rows. Within a row we show 4 small fields side-by-side: `Hole | Par | SI | Score`. This is the user-suggested vertical direction and it removes all width pressure.

Layout:

```text
+--------------------------+
|       TRACKD logo        |
|       Course name        |
|      Date · 82 (+10)     |
+------------+-------------+
| FRONT 9    |  BACK 9     |
| H P SI Sc  |  H P SI Sc  |
| 1 4  7  5  |  10 4  2  4 |
| 2 5  3  6  |  11 3 11  3 |
|  ...       |   ...       |
| 9 4 15  4  |  18 5  6  6 |
| OUT  36 42 |  IN   36 41 |
+------------+-------------+
|       TOTAL  72  83      |
+--------------------------+
```

Implementation details for `ScorecardSlide` in `src/components/RoundSummaryModal.tsx`:

- Header block kept compact: logo `h-8`, course name `text-sm` truncated, date `text-[10px]`, total score `text-2xl` with score-vs-par badge inline.
- Two-column grid: `grid grid-cols-2 gap-3`. Each column renders a `Nine`:
  - Column header row: 4 sub-cells `Hole · Par · SI · Score`, `text-[9px]` uppercase white/60.
  - 9 hole rows: `grid grid-cols-[1.5fr_1fr_1fr_1.5fr]`, `text-[11px]`, `tabular-nums`, ~18 px tall each (`py-[2px]`). Score cell uses existing `scoreCellClass()` color coding.
  - Footer row: `Out` / `In` label + Par total + Score total, `font-semibold`, subtle background.
- Bottom strip: a single `Total` row spanning full width — total par vs total score, color-coded.
- Footnote: `SI = Stroke Index`, tiny muted text.
- Side padding `px-3 py-4`. Remove inter-row gaps wider than `gap-[2px]`.
- For 9-hole rounds, render Front 9 column only (full width) — back column hidden.

### 3. Verify

Target final scorecard card height ≈ 460–500 px. Dialog interior on a 390×803 viewport (`max-h-[90vh]` ≈ 723 px) holds: title (~40) + ChallengesSection (~140) + carousel (~500) + dots (~16) + buttons (~52) = ~750 px. To keep it safely under 723:

- Drop `ChallengesSection`'s `px-4 pb-3` to `pb-2` and cap to 2 displayed challenges (it already slices to 5 — tighten to 3 in this modal context only if needed).
- Reduce the outer dialog top padding `pt-5 pb-2` to `pt-4 pb-1`.

If still tight, keep the dialog as `overflow-y-auto` as a safety net but the goal is the non-scroll fit at 390×803.

## Files touched

- `src/components/RoundSummaryModal.tsx`
  - Add `items-start` to `<CarouselContent>`.
  - Rewrite `ScorecardSlide` to the vertical two-column layout above.
  - Minor padding tightening at the modal root.
- No DB, no other components, no logic changes.
