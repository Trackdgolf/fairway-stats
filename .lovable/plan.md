

# Golf School Page with "More" Navigation

## Overview
Add a new "Golf School" page with two tabs (Drill Library and Ball Flight Laws). Replace the current Achievements tab in the bottom nav with a "More" menu that contains both Achievements and Golf School.

## Navigation Change

Replace the **Achievements (Trophy)** tab with a **More (Menu icon)** tab. Tapping "More" opens a drawer/sheet from the bottom with links to:
- Golf School (GraduationCap icon)
- Achievements (Trophy icon)

This keeps the bottom nav at 5 items: Home, Stats, Clubs, Courses, More.

## New Files

| File | Purpose |
|------|---------|
| `src/pages/GolfSchool.tsx` | Main page with PageHeader, two tabs using the existing Tabs component, BottomNav |
| `src/components/DrillLibrary.tsx` | Tab 1 content — curated list of practice drills grouped by category (Putting, Short Game, Full Swing, Course Management), each drill in a card with title, difficulty badge, description, and key focus points |
| `src/components/BallFlightLaws.tsx` | Tab 2 content — educational cards explaining the 9 ball flights (straight, draw, fade, pull, push, hook, slice, pull-hook, push-slice) with club face/path relationship diagrams using styled divs |

## Modified Files

| File | Change |
|------|--------|
| `src/components/BottomNav.tsx` | Replace Achievements entry with "More" (Menu icon). Add state + Sheet that opens on tap, listing Golf School and Achievements as navigation links |
| `src/App.tsx` | Add route `/golf-school` → `<ProtectedRoute><GolfSchool /></ProtectedRoute>` |

## Design Details

- **Page header**: Same deep green header banner as other pages, title "Golf School" with subtitle "Improve your game"
- **Tabs**: Full-width tab bar below the header using the existing `Tabs`/`TabsList`/`TabsTrigger` components, styled with `w-full grid grid-cols-2`
- **Drill Library cards**: Each drill card uses the existing `Card` component with a colored difficulty badge (Beginner = green, Intermediate = amber, Advanced = red), a bold title, concise description, and bullet points for key focuses
- **Ball Flight Laws**: Visual cards showing club face + swing path → result, using simple arrow/line graphics built with Tailwind (colored divs/borders), with explanation text below each
- **"More" sheet**: Uses the existing `Sheet` component from the bottom, with two large tappable rows (icon + label), consistent with app styling

## Static Content (No Database Needed)

All drill and ball flight content is hardcoded — no new tables or edge functions required. This keeps it simple and fast-loading.

