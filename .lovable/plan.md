

# Add Arrow to Swing Path Line in Ball Flight Diagrams

## Overview
Replace the plain red path line in each ball flight diagram with an SVG arrow that points in the swing direction, making it visually intuitive which way the club is traveling through impact.

## Change

| File | Change |
|------|--------|
| `src/components/BallFlightLaws.tsx` | Replace the `FacePathDiagram` component's path `<div>` with an SVG-based arrow line |

## How it works

Replace the current div-based path line with a small inline SVG that draws a line with an arrowhead. The arrow direction conveys the swing path:

- **Out-to-In** (e.g. Fade): Arrow points from bottom-right toward top-left (right-to-left through the ball)
- **In-to-Out** (e.g. Draw): Arrow points from bottom-left toward top-right (left-to-right through the ball)
- **Square**: Arrow points straight up (bottom to top, along target line)

The SVG will be rotated using the same `pathAngle` logic. The green club face line (thick bar) stays as-is. The target line and labels remain unchanged.

The arrowhead will use an SVG `<marker>` definition with `fill` matching the destructive/red color, attached to the end of the path line.

