

## Fix Scramble Tab Filter Overflow on Mobile

The scramble filter row uses a `ScrollArea` with `flex` layout, and the time range dropdown (`w-[120px]`) combined with 4 buttons and `ml-auto` pushes it beyond the screen edge.

### Changes

**`src/pages/ClubPerformance.tsx`** (scramble filter section, ~lines 175-206):

- Remove the `ScrollArea` wrapper -- the items should fit on one row without scrolling.
- Use a standard `flex` container with `gap-2` and `mb-6`.
- Reduce the scramble button gaps slightly by using `gap-1.5`.
- Shrink the time range dropdown from `w-[120px]` to `w-[100px]`.
- Keep `ml-auto` on the dropdown so it right-aligns, fitting cleanly within the page margins.

This mirrors how the tee shots/approach filter row already works (a simple `flex` div, no `ScrollArea`), keeping everything within the `px-4` page padding.

