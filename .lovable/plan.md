

# Link GOAT Challenges to Progressive Sequences

## What Changes

Two challenges currently in the GOAT category need to be tagged as the final milestones of existing progressive sequences so they stay hidden until the previous milestone is completed:

1. **"I didn't think this was possible!"** (200 rounds) -- becomes `sequence: "rounds-played", sequenceOrder: 7` (follows "Triple Digits!" at sequenceOrder 6)
2. **"1000 miles club"** (1000 miles) -- becomes `sequence: "distance", sequenceOrder: 14` (follows "LEJOG" at sequenceOrder 13)

They remain in the "goat" group for display purposes, but the existing `filterSequentialChallenges` logic will automatically hide them until the previous milestone in their sequence is completed.

No other files need to change -- the filtering logic in Achievements.tsx already handles cross-group sequences.

## Technical Details

### File to modify:
- **`src/lib/challengeDefinitions.ts`** -- Add `sequence` and `sequenceOrder` properties to these two challenge definitions

