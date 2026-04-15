

# Populate Drills Tab with New Content (Section 1 of 6: Putting)

## Overview
Rebuild the DrillLibrary component to support richer drill data (equipment, duration, target handicap, coaching cue) and populate with the first 8 putting drills. The component will use collapsible cards matching the Impact Laws pattern. More sections will be added as you provide them.

## Changes

| File | Change |
|------|--------|
| `src/components/DrillLibrary.tsx` | Expand data model, add collapsible card UI, populate with 8 putting drills |

## Updated Data Model

```typescript
interface Drill {
  id: string;
  title: string;
  difficulty: Difficulty;
  targetHdcp: string;
  equipment: string;
  durationMins: number;
  description: string;
  coachingCue: string;
}
```

## Card Design

Each drill rendered as a collapsible `Card` (matching Impact Laws style):
- **Header (always visible):** Title, difficulty badge, duration pill (e.g. "10 min")
- **Expanded content:** Description, coaching cue in a highlighted callout, and metadata chips for Equipment, Target Handicap

## Content — Putting (8 drills)

| ID | Title | Difficulty |
|----|-------|-----------|
| PUT-001 | Gate Drill | Beginner |
| PUT-002 | Clock Drill | Beginner |
| PUT-003 | Ladder Drill | Intermediate |
| PUT-004 | Coin Drill | Intermediate |
| PUT-005 | String Line Drill | Beginner |
| PUT-006 | One-Handed Putting | Intermediate |
| PUT-007 | Eyes Closed Drill | Advanced |
| PUT-008 | 3-6-9 Pressure Drill | Intermediate |

## Waiting for Remaining Sections
Once approved, I'll implement section 1 and the updated component structure. You can then send sections 2–6 and I'll add them incrementally.

