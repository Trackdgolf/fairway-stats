

## Add Par-Based Performance Breakdown to Course Detail View

A new summary card will be added below the Front 9 / Back 9 card, showing average performance vs par grouped by hole type: Par 3s, Par 4s, and Par 5s.

### What It Will Look Like

A card with the heading "Performance by Par" containing a 3-column layout:
- **Par 3** -- average over par total and per-hole average
- **Par 4** -- average over par total and per-hole average
- **Par 5** -- average over par total and per-hole average

Each value will be color-coded using the same relative color system already in use on the page. The layout mirrors the existing Front 9 / Back 9 card for visual consistency.

### Technical Details

**`src/pages/Courses.tsx`** (insert after the Front 9 / Back 9 card, around line 120):

- Group `selectedCourse.holes` by their `par` value (3, 4, 5)
- For each group, calculate the total and per-hole average `avgOverPar`
- Render a new `Card` with a 3-column grid showing the results
- Use `getOverParColor` and `formatOverPar` (already defined) for styling
- Columns separated by `border-l border-border` dividers (matching the Front 9/Back 9 card)
- Only show groups that have holes (e.g., skip Par 5 column if the course has none)

No changes to hooks or data fetching -- all data is already available in `selectedCourse.holes`.
