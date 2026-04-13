

# Add Stock Yardages Feature

## Overview
Add the ability for players to set stock yardages per club, and view them in a new "Distances" section on the Club Performance page alongside the existing "Dispersion" content.

## Changes

### 1. Database — Add `stock_yardages` column to `user_preferences`
Add a new JSONB column `stock_yardages` to the existing `user_preferences` table. Format: `{ "clubId": yardage }` e.g. `{ "1": 250, "7": 155 }`. Default: `'{}'::jsonb`.

### 2. Update `useUserPreferences` hook
- Add `stockYardages` state (type `Record<string, number>`)
- Load/save it from the new column alongside existing preferences
- Add `saveStockYardages` function
- Migrate from localStorage if needed (same pattern as other prefs)

### 3. Club Performance page — Add top-level toggle
Add a two-option toggle above the existing tabs: **Dispersion** | **Distances**
- When "Dispersion" is selected: show the existing tee shots / approach / scramble tabs and content (no change)
- When "Distances" is selected: show the new distances view

### 4. New `ClubDistances` component
Displays the user's clubs with their stock yardages in a clean list/card layout:
- Each club shows its name and editable yardage field
- Users can tap a yardage to edit it inline
- Shows distance unit based on user context (yards)
- Empty state prompts users to add their yardages

### 5. Settings page — Optional yardage entry
On the existing "My Bag" section in Settings, add the ability to set stock yardages per club (small input next to each club name). This gives users two places to manage yardages: Settings and the Distances view.

## Technical Details

| File | Change |
|------|--------|
| Migration SQL | `ALTER TABLE user_preferences ADD COLUMN stock_yardages jsonb DEFAULT '{}'::jsonb` |
| `src/hooks/useUserPreferences.ts` | Add stockYardages state, load/save logic, `saveStockYardages` function |
| `src/pages/ClubPerformance.tsx` | Add top-level "Dispersion" / "Distances" toggle; conditionally render existing content or new ClubDistances component |
| `src/components/ClubDistances.tsx` | New component — list of clubs with editable stock yardage fields |
| `src/pages/Settings.tsx` | Add yardage input next to each club in My Bag section |

