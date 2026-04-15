

# Center Personal SI Badge in Hole Detail

## Problem
The Personal SI badge in the hole detail summary card is left-aligned within its column, while the "Personal SI" label text is centered. This creates a visual misalignment.

## Fix
In `src/components/HoleDetail.tsx` line 86, add `flex flex-col items-center` to the parent `<div>` so both the label and the badge are horizontally centered within the grid column.

**Before:** `<div>`
**After:** `<div className="flex flex-col items-center">`

