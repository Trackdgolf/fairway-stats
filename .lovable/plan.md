

# Reduce Dispersion Graphic Size on Club Performance Page

## Approach
Add an optional `compact` prop to both `FairwayDispersion` and `GreenDispersion` components. When `compact` is true, constrain the image to 70% width (centered). This only affects the Club Performance page — the Hole Detail page's `TeeOutcomeDispersion` component uses its own rendering and won't be touched.

## Changes

| File | Change |
|------|--------|
| `src/components/FairwayDispersion.tsx` | Add optional `compact?: boolean` prop. When true, wrap the content in a container with `max-w-[70%] mx-auto` |
| `src/components/GreenDispersion.tsx` | Same — add `compact` prop with same scaling wrapper |
| `src/pages/ClubPerformance.tsx` | Pass `compact` to both `<FairwayDispersion>` and `<GreenDispersion>` |

No changes to `TeeOutcomeDispersion` or `HoleDetail` — those stay full size.

