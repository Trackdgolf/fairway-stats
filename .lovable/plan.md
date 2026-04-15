

# Replace AI Practice Plan with Local Drill Recommendations

## Overview
Remove the AI/edge function dependency from "Get My Practice Plan". Instead, compute the user's stats client-side (keep existing `computeStats`), identify their weakest areas, and recommend 2-3 specific drills from the hardcoded `drillData` in DrillLibrary — with contextual explanations referencing their actual numbers.

## How It Works

1. **Keep** the existing `computeStats()` logic that fetches FIR%, GIR%, avg putts, and scramble%.
2. **Map stats to drill categories** using weakness thresholds:
   - High putts (>32/round) → Putting drills
   - Low FIR% (<60%) → Driving drills
   - Low GIR% (<50%) → Approach Play drills
   - Low Scramble% (<40%) → Short Game + Up & Down drills
   - General course management → Course Management drills
3. **Rank weaknesses** by severity, pick the top 2-3.
4. **Select 1 drill per weakness** appropriate to the user's level (use stat values as a proxy — worse stats suggest beginner drills).
5. **Render a structured card** with:
   - Intro line referencing their stats (e.g. "Your FIR is 45% — let's work on that")
   - For each recommended drill: the drill title, category, difficulty badge, duration, description, and coaching cue
   - A link/button to navigate to Golf School > Drills for the full library

## Changes

| File | Change |
|------|--------|
| `src/components/DrillLibrary.tsx` | Export `drillData` array so PracticePlan can import it |
| `src/components/PracticePlan.tsx` | Replace AI streaming logic with local stat-based drill selection and structured rendering |
| `supabase/functions/practice-plan/index.ts` | No change (can be cleaned up later, but not breaking) |

## Key Details

- No network call to the AI gateway — instant results
- Drill recommendations feel personalised because they reference the user's actual stat numbers
- Download button still works, exporting the plan as plain text
- The "TRACKD Caddy" branding and card layout remain the same

