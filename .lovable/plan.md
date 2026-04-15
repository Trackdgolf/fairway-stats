

# Fix Toggle Text Contrast on Club Performance Page

## Problem
The `ToggleGroupItem` base styles set `data-[state=on]:text-accent-foreground` (white in light mode, dark in dark mode). The ClubPerformance page overrides the active background to `data-[state=on]:bg-background` but doesn't override the text color — so active text is the same color as the background, making it unreadable.

## Fix
In `src/pages/ClubPerformance.tsx` (lines 125 and 128), add `data-[state=on]:text-foreground` to both `ToggleGroupItem` classNames so the active tab text uses the standard foreground color, which contrasts properly against the background color in both light and dark modes.

