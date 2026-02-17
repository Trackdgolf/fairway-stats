

# Progressive Challenge Sequences

## What Changes

### 1. Add sequence metadata to ChallengeDefinition (`src/lib/challengeDefinitions.ts`)

Add two optional fields to `ChallengeDefinition`:
- `sequence`: string identifier grouping challenges in the same progression (e.g., `"rounds-played"`)
- `sequenceOrder`: number defining the order within the sequence (1, 2, 3...)

Apply to these progressive groups:
- **rounds-played** (6 challenges): Welcome friend (1) -> Fun Right? (10) -> Someones getting addicted (25) -> There's no stopping you! (50) -> Serious Dedication (75) -> Triple Digits! (100)
- **courses-played** (3 challenges): Course Collector (5) -> Course Connoisseur (10) -> Well Travelled (25)
- **scramble-saves** (4 challenges): Short Game Pro (10) -> Hero (25) -> Legend (50) -> God (100)
- **distance** (13 challenges): Half Marathon (13.1) -> ... -> LEJOG (874)

### 2. Filter visible challenges in UI (`src/pages/Achievements.tsx`)

Before rendering challenges in each group, apply sequence visibility logic:
- For each sequence, find the first uncompleted challenge (the "active" milestone)
- Show all completed challenges in the sequence
- Show the active (next) milestone with full title, description, and progress
- Hide all subsequent milestones entirely (don't render them at all)

Progress carries over naturally since the underlying stat (e.g., `totalRounds = 10`) is already used -- when a user completes 10 rounds, the next milestone (25) shows progress starting at 10/25.

### 3. Update challenge counts

The category header counts (e.g., "3/10") should only count visible challenges, so the total reflects what the user can currently see, not all 74.

## Technical Details

### Files to modify:
1. **`src/lib/challengeDefinitions.ts`** - Add `sequence?: string` and `sequenceOrder?: number` to `ChallengeDefinition` interface, then tag the 26 progressive challenges with their sequence info
2. **`src/pages/Achievements.tsx`** - Add a `filterSequentialChallenges` helper that takes the challenges array and returns only the visible ones (completed + next active milestone per sequence), apply before rendering
3. **`src/hooks/useAchievements.ts`** - Pass through the new `sequence` and `sequenceOrder` fields in the Challenge type

### No database changes required.

