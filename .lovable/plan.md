

# Updated Post-Round Experience with Round Report

## Overview
Transform the post-round summary from a simple modal into a fuller "Round Report" screen. The current dialog will be updated to use a scrollable full-screen layout on an off-white background (#ededed), with the existing shareable graphic shown slightly smaller, a "Round Report" title at the top, and a new challenges section highlighting completed or in-progress challenges from that round.

## Layout Changes

The current transparent dialog will become a full-width scrollable panel:

1. **Background**: Off-white (#ededed) covering the full dialog area
2. **"Round Report" title** at the top, centered, bold
3. **Challenges section** showing:
   - Challenges newly completed during this round (by comparing pre-round vs post-round state)
   - If none were completed, show up to 3 in-progress challenges closest to completion
   - Each challenge displayed as a compact card with icon, title, and progress
4. **Shareable graphic carousel** (existing light/dark cards) scaled down slightly (e.g. `max-w-xs` instead of full width)
5. **Dot indicators** (same as now)
6. **Action buttons** (Close / Save / Story / Share) - same as now but slightly smaller

## How Challenge Detection Works

The `useAchievements` hook already evaluates all challenges from lifetime data. To detect challenges completed *during this round*:

- Pass the round's `holeStats` data to the modal as a new `roundId` prop
- Inside the modal, call `useAchievements("MAX")` to get the current challenge state (which includes this just-saved round)
- Compare each challenge's `progress` against its `target` to find newly completed ones (progress === target, isCompleted === true)
- For "in progress" fallback, sort incomplete challenges by proximity to target (progress/target ratio) and show the top 3

This approach is simple - since the round was just saved, the achievements hook will include it in its evaluation. We don't need a "before/after" comparison; we just highlight completed and nearly-completed challenges.

## Technical Details

### File: `src/components/RoundSummaryModal.tsx`

**New imports:**
- `useAchievements` from `@/hooks/useAchievements`
- `ScrollArea` from `@/components/ui/scroll-area`
- `CheckCircle2`, `Target` from `lucide-react`

**New prop:**
- No new props needed - the hook fetches challenge data independently

**DialogContent changes:**
- Change from `bg-transparent` to `bg-[#ededed]` with rounded corners and padding
- Add `max-h-[90vh] overflow-y-auto` for scrollability
- Wrap content in a structured layout

**Challenge section component (inline):**
- Query `useAchievements("MAX")` to get all challenges
- Filter to completed challenges and in-progress challenges
- Display completed challenges with green checkmark icon
- If no completed challenges, show top 3 closest-to-completion with orange progress icon
- Each challenge card: icon + title + progress text, compact single-line layout

**Graphic scaling:**
- Add `transform scale-90 origin-top` or reduce max-width on the carousel wrapper to make the shareable card slightly smaller on screen

**Button row:**
- Keep as-is but ensure consistent styling against the off-white background
