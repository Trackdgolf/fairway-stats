

# Fix Hole Number Overlapping Top Border

## Problem
On the hole detail view within Courses, the "Hole X" title sits too close to the green header banner, appearing to overlap or touch the border.

## Fix
Add top padding (`pt-2`) to the root `div` of the `HoleDetail` component (line 58 in `src/components/HoleDetail.tsx`), changing `className="space-y-4"` to `className="space-y-4 pt-2"`. This gives the "Hole X" heading a small amount of breathing room below the header area.

## File Changed
| File | Change |
|------|--------|
| `src/components/HoleDetail.tsx` | Add `pt-2` to root div className |

