

# Fix "6 & 9 anyway up" Challenge Logic

## Problem

The challenge uses a numeric progress/target pattern (`progress: bestScore, target: 70`), which causes it to display "70/70" in orange when a user's best score is exactly 70. This is misleading because:
- The challenge requires shooting **under** 70, so a score of 70 doesn't qualify
- It should be a simple yes/no challenge, not a progress-based one

## Solution

Convert the challenge to use the `boolChallenge` pattern (progress 0 or 1, target 1), just like the "Scratch" and "Ready to turn Pro?" challenges right below it.

## File to modify

**`src/lib/challengeDefinitions.ts`** (lines 287-297)

Replace the current evaluate function:

```typescript
// Before
{
  id: "6-and-9-anyway-up",
  title: "6 & 9 anyway up",
  description: "Shoot Under 70 for 18 holes",
  group: "goat",
  evaluate: (s) => ({
    isCompleted: s.bestScore !== null && s.bestScore < 70,
    progress: s.bestScore !== null ? Math.min(s.bestScore, 70) : 0,
    target: 70,
  }),
},
```

With the `boolChallenge` helper:

```typescript
// After
boolChallenge("6-and-9-anyway-up", "6 & 9 anyway up", "Shoot Under 70 for 18 holes", "goat",
  (s) => s.bestScore !== null && s.bestScore < 70),
```

This will show the challenge as either locked (not yet achieved) or completed (green checkmark), with no misleading progress indicator.

