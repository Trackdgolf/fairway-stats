## Problem
The scorecard card uses `aspect-[9/16]`, which forces the card to be very tall (≈515px at carousel width). Combined with the modal's title, challenges section, dot indicators, and action buttons, the modal exceeds the 90vh cap and becomes scrollable. The other two cards size to content (~370px), which is why they fit.

## Fix
Stop forcing 9:16 on the scorecard. Instead size it like the other two cards (content-driven, comparable height) while still presenting as a portrait-oriented scorecard.

### Edits (single file: `src/components/RoundSummaryModal.tsx`)

1. **Scorecard wrapper**: remove `aspect-[9/16] flex flex-col` from the third `CarouselItem`'s outer div. Card height becomes content-driven like cards 1 and 2.

2. **`ScorecardContent` tightened to fit a ~370–400px card** (matching siblings):
   - Header block: keep logo `h-10`, drop the `text-base` course name to `text-sm`, tighten margins (`mb-1.5`, `mb-2`).
   - Two-column body: replace per-row borders + `py-[3px]` with a denser `leading-tight text-[11px]` table; rows use `py-0` and a single divider every row via `divide-y divide-white/10`.
   - Reduce header label row to `text-[9px]`.
   - Out/In totals row: `text-[10px]`, `py-0.5`.
   - Footer Total row: shrink padding (`mt-2 pt-2`), keep big Total number at `text-2xl` (down from `text-3xl`).
   - Outer padding: `p-3` (was `p-4`).

3. **No layout containers depending on `h-full`** — drop `flex-1 min-h-0` from the columns wrapper; let it size naturally.

### Why this fixes the scroll
With no aspect ratio lock and compact typography, the scorecard card collapses to roughly the same height as the dark/light cards (~360–390px). The modal's existing `max-h-[90vh] overflow-y-auto` will then have no overflow on a 390×803 viewport.

### Out of scope
- No changes to the other two cards.
- No changes to data, hooks, share logic, or carousel wiring.
