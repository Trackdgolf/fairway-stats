
# Restore the left-side SCORE ENTRY tab in the Insights drawer

## Overview
Fix the hole insights drawer so golfers always have a clear way to return to score entry. The issue is that the current drawer styling hides all direct button children inside the sheet, which unintentionally hides the custom left-edge `SCORE ENTRY` close tab as well.

The fix is to make the drawer explicitly support a hidden default close button while keeping the custom left-side close tab visible and tappable.

## What to build

### 1) Update the shared Sheet component to support hiding only the default X button
Add a small optional prop to `src/components/ui/sheet.tsx`, such as `hideCloseButton?: boolean`, on `SheetContent`.

Behavior:
- Default stays exactly the same everywhere else in the app.
- When `hideCloseButton` is `true`, the built-in top-right X is not rendered.
- No generic CSS selector like `[&>button]:hidden` should be used.

This avoids accidentally hiding custom button content inside the drawer.

### 2) Fix `HoleInsightsSheet.tsx` to use the new close-button behavior
Update `src/components/HoleInsightsSheet.tsx` so the right-side insights drawer:
- passes `hideCloseButton`
- removes the brittle `[&>button]:hidden` class
- keeps the custom `SheetClose asChild` left-edge pull-tab visible

The left tab should remain:
- fixed on the left edge
- vertically centered
- labeled `SCORE ENTRY`
- styled to mirror the right-side `INSIGHTS` tab
- the primary dismissal control for the drawer

### 3) Keep the score-entry flow feeling like one continuous screen
Maintain the current UX where:
- right tab opens insights
- left tab closes insights
- closing the drawer does not navigate away or reset input
- the golfer returns directly to the same hole entry state

This matches the intended “extension of the score entry screen” behavior.

## Files to change

| File | Change |
|---|---|
| `src/components/ui/sheet.tsx` | Add optional `hideCloseButton` prop to `SheetContent` and conditionally render the built-in X close button |
| `src/components/HoleInsightsSheet.tsx` | Remove `[&>button]:hidden`, use `hideCloseButton`, keep custom left-edge `SCORE ENTRY` close tab visible |

## Technical details
- Root cause: `SheetContent` currently renders the default close button as a direct child, and `HoleInsightsSheet` uses `[&>button]:hidden`, which hides both the default close button and the custom `SheetClose asChild` button.
- Safer pattern: control the default X in the `SheetContent` component itself instead of hiding all child buttons with CSS.
- No database or backend changes.
- No changes needed in `Round.tsx` or `EditRound.tsx` unless spacing needs a tiny adjustment after restoring the left tab.

## Expected result
On the score entry pages:
- user taps the right `INSIGHTS` tab
- insights sheet opens
- user sees a left `SCORE ENTRY` tab immediately
- tapping that tab closes the sheet and returns them to score entry on the same hole

## QA
Verify on mobile viewport:
1. Open a round on `/round`
2. Tap `INSIGHTS`
3. Confirm the left `SCORE ENTRY` tab is visible
4. Tap `SCORE ENTRY`
5. Confirm the drawer closes and score entry remains intact
6. Repeat on `EditRound`
7. Confirm other sheets in the app still show their normal top-right X
