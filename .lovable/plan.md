
# Fix Challenge Counter to Show True Total (74)

## Problem

The counter currently shows `completed/visible` (e.g., 5/52) because it uses `filterSequentialChallenges` which excludes hidden sequential milestones. The total should always be 74 (all challenges), and the completed count should include all completed challenges regardless of visibility.

## Solution

In `src/pages/Achievements.tsx`, change the counter logic at the "Challenges" header from:

```
const allVisible = filterSequentialChallenges(data.challenges);
const completed = allVisible.filter(c => c.isCompleted).length;
return `${completed}/${allVisible.length}`;
```

To:

```
const completed = data.challenges.filter(c => c.isCompleted).length;
return `${completed}/${data.challenges.length}`;
```

This uses `data.challenges` directly (all 74) for both the completed count and the total, without applying the sequential filter.

## File to modify
- **`src/pages/Achievements.tsx`** -- Update the counter calculation (lines ~308-311)
