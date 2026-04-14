

# Add "Impact Laws" Tab to Golf School

## Overview
Add a third tab to the Golf School page containing 8 detailed impact law cards, using the content provided. No database needed — all content is hardcoded.

## Changes

| File | Change |
|------|--------|
| `src/pages/GolfSchool.tsx` | Add third tab trigger "Impact Laws", update grid to `grid-cols-3`, add `TabsContent` for the new `ImpactLaws` component |
| `src/components/ImpactLaws.tsx` | **New file** — renders all 8 impact laws as expandable cards |

## Component Design — `ImpactLaws.tsx`

Each of the 8 laws rendered as a `Card` with:
- **Title** (e.g. "Face Angle at Impact") and **category badge** (Direction, Distance, Trajectory, etc.)
- **Impact factor** shown as a highlighted callout (e.g. "~75% of start direction")
- **Explanation** — main body text, shown by default
- **Collapsible sections** using the existing `Collapsible` component:
  - "On Course" — practical application
  - "How to Diagnose" — self-diagnosis tips

This keeps cards scannable while allowing users to dive deeper. All 8 entries from the provided data are hardcoded as a typed array.

## Content Mapping

| ID | Name | Category |
|----|------|----------|
| BFL-01 | Face Angle at Impact | Direction |
| BFL-02 | Swing Path | Direction |
| BFL-03 | Face-to-Path Relationship | Direction / Curvature |
| BFL-04 | Sweet Spot Strike | Distance / Direction |
| BFL-05 | Ground Contact | Distance / Consistency |
| BFL-06 | Angle of Attack | Trajectory / Distance |
| BFL-07 | Dynamic Loft & Spin Loft | Trajectory / Spin / Distance |
| BFL-08 | Ball Speed | Distance |

## Static Content Only
No database tables, migrations, or edge functions needed. All content is hardcoded in the component file.

