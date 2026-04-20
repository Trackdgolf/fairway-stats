

# Course Insights Drawer on Score Entry

## Overview
Add a small pull-tab on the right edge of the score entry pages (`Round.tsx` and `EditRound.tsx`) that opens a side drawer showing the **same hole-specific insights** the user already gets in `Courses → Course → Hole`: avg score / vs par / personal SI, the Tee Shot dispersion overlay, the Scramble U&D dispersion overlay, and recent rounds. This lets players reference their own history (best aim, worst miss) without leaving the round they're playing.

Premium-gated, since Courses analytics is premium-only.

## UX

- A small vertical tab fixed to the right side of the screen, vertically centered, labeled "Insights" with a chevron icon. Always visible while entering scores.
- Tapping it opens a right-side `Sheet` (`@/components/ui/sheet`, side="right") covering most of the screen.
- The sheet content shows insights for the **current hole** (`currentHoleIndex + 1`), and updates automatically as the user navigates between holes (Prev / Next).
- Header inside the sheet: "Hole {n} · Par {par}" + close button.
- If the user has no prior rounds at this course / hole: friendly empty state ("Play this hole at least once to unlock insights").
- If user is not premium: locked state inside the sheet with a "Unlock Premium" button that opens the existing `PaywallModal`.

## Layout

```text
┌────────────── Score Entry ──────────────┐
│  Hole 5 · Par 4 · 412 yds            ┃◀ │ ← pull-tab (right edge)
│                                       ┃  │
│  Score  [-] 4 [+]                     ┃  │
│  FIR / GIR ...                        ┃  │
│  ...                                  ┃  │
└──────────────────────────────────────────┘

When opened (right sheet):
┌──────────────────── Insights ─────────────┐
│  Hole 5 · Par 4                       [✕] │
│  ┌─────────────────────────────────────┐  │
│  │ Avg 4.6   +0.6 vs par   SI 3        │  │
│  └─────────────────────────────────────┘  │
│  [ Tee Shot ] [ Scramble ]                │
│  <dispersion image with overlays>         │
│  Recent Rounds (filtered by tab)          │
└────────────────────────────────────────────┘
```

## Reuse Strategy

The bulk of the UI already exists in `HoleDetail.tsx` (summary card, tabs, `TeeOutcomeDispersion`, `ScrambleOutcomeDispersion`, recent rounds list). To avoid duplication, extract the body of `HoleDetail` (everything below the page header / nav row) into a shared subcomponent **`HoleInsightsContent`** that takes:

```ts
{
  courseId: string;
  holeNumber: number;
  par: number;
  avgScore?: number;        // optional — only used by Courses page
  avgOverPar?: number;
  personalStrokeIndex?: number;
  showSummary?: boolean;    // hide summary stats if hole hasn't been played yet
}
```

`HoleDetail.tsx` keeps its existing wrapper (back button, prev/next nav, title) and renders `<HoleInsightsContent />` inside. The new sheet on Round/EditRound also renders `<HoleInsightsContent />`, but with no prev/next (the user already has those on the score entry page itself).

When the player has no rounds at this course/hole, `useHoleHistory` returns empty → `HoleInsightsContent` shows: "No data for this hole yet — play it once to see insights."

## Files Changed

| File | Change |
|---|---|
| `src/components/HoleInsightsContent.tsx` | **New.** Extract body of `HoleDetail.tsx` (summary + tabs + dispersions + recent rounds). Compute summary stats locally from `useHoleHistory` data when not passed in. |
| `src/components/HoleDetail.tsx` | Refactor to render header/nav + `<HoleInsightsContent />`. No behavior change. |
| `src/components/HoleInsightsSheet.tsx` | **New.** Right-side `Sheet` containing the pull-tab trigger and `<HoleInsightsContent />`. Handles premium gate + `PaywallModal`. Props: `courseId`, `holeNumber`, `par`. |
| `src/pages/Round.tsx` | Mount `<HoleInsightsSheet courseId={course.id?.toString()} holeNumber={currentHoleIndex+1} par={currentHole?.par} />` once inside the page wrapper. |
| `src/pages/EditRound.tsx` | Mirror the same mount for parity. Use the round's `course_id` and the active hole number / par. |

## Pull-Tab Component

Inside `HoleInsightsSheet.tsx`:

```tsx
<SheetTrigger asChild>
  <button
    aria-label="View hole insights"
    className="fixed right-0 top-1/2 -translate-y-1/2 z-30
               bg-primary text-primary-foreground
               rounded-l-lg shadow-lg
               px-2 py-3 flex flex-col items-center gap-1
               writing-mode-vertical"
  >
    <ChevronLeft className="w-4 h-4" />
    <span className="text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180">
      INSIGHTS
    </span>
  </button>
</SheetTrigger>
<SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
  ...
</SheetContent>
```

## Technical Notes

- Premium check: reuse `usePremiumStatus()`. Non-premium → sheet body shows the same lock card pattern used in `Courses.tsx` (Crown icon + "View Premium Options" → `PaywallModal`).
- `courseId` for `useHoleHistory` comes from `course.id?.toString()` on Round.tsx (same value used at round insert) and from the loaded round's `course_id` on EditRound.tsx. If `courseId` is missing, the trigger is hidden.
- The sheet sits above the score-entry content (`z-30` for tab, default sheet z for the panel). Bottom nav is not present on Round/EditRound, so no overlap concern.
- No DB or schema changes. Pure UI + reuse of existing hooks (`useHoleHistory`, `usePremiumStatus`).
- Mobile-first; tested target viewport 390px.

