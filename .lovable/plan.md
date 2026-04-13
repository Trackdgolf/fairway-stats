

# Redesign Tee Shot Outcome Graphic

## Overview
Replace the current colored tile grid with a visual dispersion diagram matching the existing fairway/green dispersion style used elsewhere in the app. For par 4/5 holes, overlay stats on the fairway image. For par 3 holes, overlay on the green image. Instead of showing percentages, show the average score relative to par (e.g. "+0.9") and sample count.

## Design
The component will reuse the same `fairway-dispersion.png` and `green-dispersion.png` assets already in the app, with labels overlaid at the same positions as `FairwayDispersion` and `GreenDispersion`. Each label will show the avg-over-par value (color-coded: green for under, yellow for even, orange/red for over) and the round count, using the same dark pill (`bg-black/75`) styling.

This keeps the hole detail page visually consistent with the Club Performance dispersion graphics.

## Changes

| File | Change |
|------|--------|
| `src/components/TeeOutcomeDispersion.tsx` | Full redesign — use fairway/green image with positioned overlays instead of grid tiles. Show avg over par + count per direction zone. Use fairway image for par 4/5, green image for par 3. |

No other files change. The data logic stays the same — only the presentation changes.

