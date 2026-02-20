

## Add "Penalty %" Indicator to Tee Shots Dispersion Graphic

### Summary
Add a new percentage label showing the penalty rate on the fairway dispersion image, positioned center-bottom of the graphic (below the existing SHORT label area).

### Changes

**1. `src/hooks/useDispersionStats.ts` -- Calculate penalty percentage**
- Add `penalty: number` to the `teeShots` object in the `DispersionStats` interface
- In the tee dispersion calculation block, compute penalty % the same way as the other directions:
  ```
  penalty: teeShotTotal > 0 ? Math.round((teeShots.filter(s => s.fir_direction === 'penalty').length / teeShotTotal) * 100) : 0
  ```
- Add `penalty: 0` to the empty-stats fallback return

**2. `src/components/FairwayDispersion.tsx` -- Display penalty label**
- Add `penalty: number` to `FairwayDispersionProps`
- Add a new absolutely-positioned `DispersionLabel` at the bottom-center of the graphic (below where SHORT sits), using `bottom-2` and centered horizontally
- Only show when `penalty > 0` (same pattern as SHORT)
- Label text: "PENALTY"

**3. `src/pages/ClubPerformance.tsx` -- Pass penalty prop**
- Pass the new `penalty` value from `teeDispersion.penalty` to the `FairwayDispersion` component

### Layout

The existing SHORT label sits at `bottom-8`. The new PENALTY label will sit at `bottom-2`, directly below SHORT, centered horizontally -- keeping the same visual style as all other dispersion labels.
