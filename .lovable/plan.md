

# Show Round-Specific Challenges in Round Report

## Problem
The challenges section currently shows ALL completed challenges across all rounds. Every round report displays the same list because it queries lifetime achievement data with no per-round filtering.

## Solution
Compare challenge progress **with** and **without** the current round to detect which challenges were newly completed or progressed by this specific round.

The approach:
1. Pass the round's hole stats data to `ChallengesSection`
2. Use `buildUserStats` twice: once with all data (current state), once excluding the current round's holes
3. Evaluate challenges against both sets of stats
4. Challenges that are completed in the "with" set but NOT in the "without" set were completed by this round
5. If none were completed, show the top 3 in-progress challenges with their current progress (e.g. "7/10")

## Technical Details

### File: `src/hooks/useAchievements.ts`
- **Export** the `buildUserStats` function so it can be reused outside the hook

### File: `src/components/RoundSummaryModal.tsx`

**Update `RoundSummaryModalProps`:**
- Add `roundId?: string` prop so we can identify this round's data

**Update `ChallengesSection`:**
- Accept `roundId` and `holeStats` props
- Fetch all rounds and hole stats from the achievements hook data
- Run `CHALLENGE_DEFINITIONS.map(def => def.evaluate(...))` twice:
  - Once with full `UserStats` (all rounds including this one)
  - Once with `UserStats` built from all rounds **excluding** the current `roundId`
- A challenge is "newly completed by this round" if `withRound.isCompleted === true` and `withoutRound.isCompleted === false`
- If no newly completed challenges, fall back to showing up to 3 in-progress challenges sorted by `progress/target` ratio, displayed as "Title - 7/10"

**Where `roundId` comes from:**
- In `Round.tsx`, after saving the round to the database, the round ID is available and can be passed to the modal
- In `Home.tsx`, the round ID is already known from the selected round data

### Files: `src/pages/Round.tsx` and `src/pages/Home.tsx`
- Pass the `roundId` prop when rendering `RoundSummaryModal`

### Display logic
- Newly completed challenges: green checkmark icon, title only
- In-progress challenges: orange target icon, title + progress counter (e.g. "7/10") with a small progress bar
- Show up to 5 completed or 3 in-progress

