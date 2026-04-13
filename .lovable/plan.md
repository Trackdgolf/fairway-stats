

# Add Hole Detail View to Courses Page

## Overview
When viewing a course's hole performance table, make each hole row clickable. Tapping a hole navigates to a detail screen showing the 5 most recent times the user played that hole, with tee club used and the tee shot outcome (FIR hit/miss direction).

## Approach
This stays within the Courses page using local state (no new routes needed) — adding a third navigation depth: Course List → Course Detail → Hole Detail.

## Changes

### 1. New hook: `src/hooks/useHoleHistory.ts`
- Accepts `courseId` (or `courseName`) and `holeNumber`
- Queries `hole_stats` joined with `rounds` (filtered by user and course)
- Selects: `score`, `par`, `tee_club`, `fir`, `fir_direction`, `rounds.played_at`
- Orders by `rounds.played_at` descending, limits to 5
- Returns array of recent hole plays

### 2. New component: `src/components/HoleDetail.tsx`
- Header with back button, "Hole X" title, and par info
- List of 5 most recent plays, each showing:
  - Date played
  - Score (with +/- par color coding)
  - Tee club used
  - Tee shot result: "Fairway Hit", "Missed Left", "Missed Right" (derived from `fir` and `fir_direction`)
- Empty state if no data

### 3. Update `src/pages/Courses.tsx`
- Add `selectedHole` state (stores hole number or null)
- Make each `TableRow` in the hole performance table clickable with a chevron indicator
- When `selectedHole` is set, render `HoleDetail` instead of the course detail view
- Back button returns to course detail

## Technical Details

| File | Change |
|------|--------|
| `src/hooks/useHoleHistory.ts` | New hook — queries 5 most recent plays of a specific hole at a specific course |
| `src/components/HoleDetail.tsx` | New component — displays recent hole history with tee shot data |
| `src/pages/Courses.tsx` | Add selectedHole state, make hole rows clickable, conditionally render HoleDetail |

No database changes needed — all data exists in `hole_stats` and `rounds`.

