

# Fix: Show specific miss direction for all tee shot outcomes

## Problem
The `getTeeResult` function only checks for `left` and `right` directions. Your data also includes `short` and `penalty` as possible miss directions, which fall through to the generic "Missed" label.

## Changes

### Update `src/components/HoleDetail.tsx`
Update the `getTeeResult` function to handle all five `fir_direction` values:

- `left` -> "Missed Left"
- `right` -> "Missed Right"  
- `short` -> "Missed Short"
- `penalty` -> "Penalty" (red color)
- `hit` -> edge case where `fir=false` but direction is `hit` -- show "Missed"

| File | Change |
|------|--------|
| `src/components/HoleDetail.tsx` | Add `short` and `penalty` cases to `getTeeResult` function |

