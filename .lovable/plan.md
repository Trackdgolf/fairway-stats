

# Align Edit Round Screen with New Round Screen

## Overview
The Edit Round screen is missing key UI elements and has a different layout compared to the New Round entry screen. This plan updates EditRound.tsx to match Round.tsx exactly in terms of field ordering, shot direction placement, club selector style, and hole info display.

## Changes needed in `src/pages/EditRound.tsx`

### 1. Add Yards display to hole info header
The Round screen shows Hole, Par, and Yards in the header card. EditRound only shows Hole and Par. Add the Yards column (using the `yardage` field from hole_stats data).

### 2. Replace Select dropdowns with ClubSelectorDrawer
Round.tsx uses the `ClubSelectorDrawer` component for Tee Club, Approach Club, and Scramble Club selection. EditRound uses basic `<Select>` dropdowns. Replace all three with `ClubSelectorDrawer` and matching button-style triggers.

### 3. Restructure field ordering to match Round.tsx
Reorder the stats entry section to match:
- Score
- FIR/GIR toggle row (Yes/No only, no direction selectors here)
- Scramble (Yes/No/N/A)
- Scramble Club and Shot Type (when scramble is Yes or No)
- Putts
- Tee Club (with FIR direction selector underneath, on non-par-3 holes)
- Approach Club (with GIR direction selector underneath, hidden on par 3s)

### 4. Move shot direction selectors
- Remove FIR/GIR direction selectors from the FIR/GIR toggle section
- Place FIR direction selector under Tee Club (always visible on non-par-3 holes, showing all options including "Hit")
- Place GIR direction selector under Approach Club (always visible, showing all options)
- On par 3s, show GIR direction under Tee Club instead

### 5. Add required state and imports
- Add state variables for `teeClubDrawerOpen`, `approachClubDrawerOpen`, `scrambleClubDrawerOpen`
- Import `ClubSelectorDrawer` and `ChevronDown` icon

## Technical details

### File: `src/pages/EditRound.tsx`

**Imports to add:**
- `ClubSelectorDrawer` from `@/components/ClubSelectorDrawer`
- `ChevronDown` from `lucide-react`

**Imports to remove:**
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` (no longer needed)

**State to add (around line 196):**
```tsx
const [teeClubDrawerOpen, setTeeClubDrawerOpen] = useState(false);
const [approachClubDrawerOpen, setApproachClubDrawerOpen] = useState(false);
const [scrambleClubDrawerOpen, setScrambleClubDrawerOpen] = useState(false);
```

**HoleStats interface note:**
EditRound uses snake_case field names (`fir_direction`, `gir_direction`, `tee_club`, etc.) since it reads directly from the database, while Round.tsx uses camelCase. The field references will stay as snake_case.

**Hole info header (around line 382-412):**
Add a third column for Yards between Par and the progress bar, using `currentHole?.yardage`.

**Stats entry section (lines 416-618):**
Completely restructure to match Round.tsx ordering:
1. Score (keep as-is)
2. FIR/GIR toggles (Yes/No only, remove direction selectors from here)
3. Scramble section with ClubSelectorDrawer and shot type
4. Putts
5. Tee Club with ClubSelectorDrawer and FIR direction selector
6. Approach Club with ClubSelectorDrawer and GIR direction selector

**Key behavioral differences to align:**
- FIR direction: show all options (including "Hit") always under Tee Club, not just when FIR is "No"
- GIR direction: show all options always under Approach Club
- On par 3: show GIR direction under Tee Club section instead of Approach Club
- Scramble Club label shown as separate labeled section

This is a single-file change affecting `src/pages/EditRound.tsx` only.
