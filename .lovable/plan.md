## Goal
Add a third shareable graphic to the Round Report carousel in `src/components/RoundSummaryModal.tsx`: a vertical scorecard that fits within a 9:16 mobile frame without scrolling, with branding consistent with the first (green gradient) card.

## Layout

```text
┌──────────────────────────────┐
│         [TRACKD logo]        │
│         Course Name          │
│         26 May 2026          │
│ ──────────────────────────── │
│  FRONT 9         BACK 9      │
│  H  Par Score  H  Par Score  │
│  1   4   5    10   4   4     │
│  2   3   3    11   5   6     │
│  …            …              │
│  9   4   5    18   4   5     │
│  ──────       ──────         │
│  OUT 36 42   IN  36 40       │
│ ──────────────────────────── │
│       TOTAL   72   82  +10   │
└──────────────────────────────┘
```

- Same green gradient + white text as the first (light) card.
- TRACKD logo at top (smaller than first card to leave room), course name + date below.
- Two columns side-by-side, each a 9-row mini table with H / Par / Score headers.
- Sub-totals: OUT (front 9 par + score) and IN (back 9 par + score) at the foot of each column.
- TOTAL row spans full width: total par, total score, score vs par with the same color scale used elsewhere.
- Score cells use subtle pill backgrounds based on score-vs-par (eagle/birdie/par/bogey/+) — reuse semantic colors already used in the round entry pages where possible, or simple white/translucent pills if too noisy.

## Sizing & no-scroll guarantee

- Card wrapper uses `aspect-[9/16]` so it locks to mobile shape regardless of carousel width.
- Inner content uses `h-full flex flex-col` with small, fixed paddings (`p-4`) and `text-[10px]`/`text-xs` for table rows so 9 rows + headers + totals comfortably fit.
- Logo: `h-10` (vs `h-[4.5rem]` on card 1) to keep vertical budget tight.
- Course name single-line with `truncate`; date `text-[11px]`.

## Carousel integration

- Add a third `<CarouselItem>` after the existing dark card.
- Add a third `ref` (`scorecardRef`) and include it in `handleShare`/`handleSaveImage`/`handleInstagramShare` selection (`activeIndex === 0 ? light : activeIndex === 1 ? dark : scorecard`).
- Dot indicators: change `[0, 1]` to `[0, 1, 2]`.

## Data

`holeStats` is already passed in as a 18-length array of `{ score, par, … }`. Compute:
- `front = holeStats.slice(0, 9)`, `back = holeStats.slice(9, 18)`
- `outPar`/`outScore`, `inPar`/`inScore`, plus existing `totalPar`/`totalScore`/`scoreVsParStr`/`scoreVsParColor`.
- Handle missing par/score gracefully (`—`).

## Out of scope

- No changes to data fetching, hooks, or DB.
- No new dependencies.
- No changes to the existing two cards' visuals.
