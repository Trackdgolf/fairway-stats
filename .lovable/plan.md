

# Simplify Hole Detail Header

## Problem
The HoleDetail component header shows "Hole X" with "Par X · Course Name" below it. The course name is redundant since it's already displayed in the parent Courses page header. The user wants a cleaner header showing just the hole number and yardage.

## Changes

### 1. Update `src/hooks/useHoleHistory.ts`
- Add `yardage` to the Supabase select query
- Add `yardage` to the `HolePlay` interface
- Return yardage from the most recent play (to show hole distance)

### 2. Update `src/components/HoleDetail.tsx`
- Remove the course name from the subtitle
- Change subtitle from "Par X · Course Name" to "Par X · XXX yards" (using yardage from the most recent play, if available)
- Remove `courseName` prop since it's no longer needed
- If no yardage data exists, just show "Par X"

### 3. Update `src/pages/Courses.tsx`
- Remove `courseName` prop from `HoleDetail` usage (no longer needed)

| File | Change |
|------|--------|
| `src/hooks/useHoleHistory.ts` | Add `yardage` to query and interface |
| `src/components/HoleDetail.tsx` | Remove course name, show yardage instead |
| `src/pages/Courses.tsx` | Remove `courseName` prop from HoleDetail |

