

## Preview Round Summary Graphic

### Overview
Add a temporary preview mechanism to see the Round Summary Modal with sample data, without needing to complete a full round.

### Approach
Add a hidden/dev "Preview Summary" button on the Home page that opens the `RoundSummaryModal` with realistic demo data. This lets you review and tweak the graphic design quickly.

### Changes

**Modified file: `src/pages/Home.tsx`**
- Import `RoundSummaryModal`
- Add state to toggle the modal open/closed
- Add a small "Preview Summary" button (can be removed later)
- Pass sample data to the modal:
  - Course name: "St Andrews Old Course"
  - Total score: 78
  - 18 holes of realistic sample stats (mix of FIR/GIR hits and misses, varied putts)
  - Date: today's date

This is meant as a temporary tool for design review and can be removed once you're happy with the look.

### Technical Details
- No new files or dependencies needed
- Reuses the existing `RoundSummaryModal` component as-is
- Sample hole data will include par values so score vs par calculates correctly
- The button can be styled subtly or removed entirely once the design is finalized
