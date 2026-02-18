

# Remove Orange Background from In-Progress Challenges

## Overview
Remove the orange background tint from in-progress challenge cards while keeping the orange icon and counter text.

## Change

In `src/pages/Achievements.tsx`, update the `getChallengeStatus` function's in-progress case:

**Current:**
```tsx
bgClass: "border-orange-500/30 bg-orange-500/10",
```

**New:**
```tsx
bgClass: "border-orange-500/30",
```

This removes the `bg-orange-500/10` background while keeping the subtle orange border, the orange icon, and the orange progress counter text.

## Technical details
- Single line change in `src/pages/Achievements.tsx`
- Only affects the `getChallengeStatus` function's in-progress branch (around line 127)
- No logic changes

