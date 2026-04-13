

# Add Club Reordering via Drag-and-Drop

## Overview
Allow users to long-press a club in the "My Bag" section of Settings to enter a reorder mode, then drag clubs to rearrange them. The new order persists and is reflected everywhere clubs are listed (including the Distances view).

## Changes

### 1. Install `@dnd-kit` library
Add `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` — a lightweight, accessible drag-and-drop library that works well on both desktop and mobile (supports touch sensors with activation delay for long-press).

### 2. Update `useUserPreferences` hook
- Add a `reorderClubs` function that accepts a new ordered array and calls `saveClubs`
- Export it alongside the existing club functions

### 3. Update Settings page — My Bag section
- Wrap the club grid in a `DndContext` + `SortableContext` from dnd-kit
- Each club card becomes a `useSortable` item with a drag handle / long-press activation
- On drag end, compute the new order and call `reorderClubs`
- Add a subtle grip icon (GripVertical) to each club card to hint at draggability
- Use `TouchSensor` with a 200ms activation delay so tapping to edit still works, and `PointerSensor` with a small distance constraint for desktop

### 4. No database changes needed
Club order is already stored as a JSON array in the `my_bag` column — the array index IS the order. Reordering just saves the array in the new sequence.

## Technical Details

| File | Change |
|------|--------|
| `package.json` | Add `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| `src/hooks/useUserPreferences.ts` | Add `reorderClubs(newClubs: Club[])` function, export it |
| `src/pages/Settings.tsx` | Import dnd-kit, wrap club grid in DndContext/SortableContext, make each club a sortable item with touch sensor (long-press activation) |

