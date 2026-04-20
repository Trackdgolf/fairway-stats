

# Reduce Score Entry UI Size by ~25%

## Overview
Shrink the data-entry controls on the score-entry pages (`Round.tsx` and `EditRound.tsx`) so users can see more fields without scrolling. The reduction targets roughly **25%** smaller in height and visual weight, while keeping touch targets comfortable on mobile (Apple's 44px / Android 48dp minimum).

To stay in strict UI parity (per project rule), the same edits apply to both `Round.tsx` and `EditRound.tsx`. The shared `ClubSelectorDrawer` is also updated since its buttons are part of the entry flow.

## Size Changes

| Element | Current | New (~75%) |
|---|---|---|
| **NumberStepper** +/- buttons | `w-14 h-14` (56px) | `w-11 h-11` (44px) |
| NumberStepper +/- icons | `w-6 h-6` | `w-5 h-5` |
| NumberStepper value box | `w-24 h-16` | `w-20 h-12` |
| NumberStepper value font | `text-4xl` | `text-3xl` |
| NumberStepper gap | `gap-4` | `gap-3` |
| **ToggleButton** (Yes/No, Pitch/Chip/Bunker) | `h-12` | `h-9` |
| **ShotDirectionSelector** circles | `w-12 h-12` | `w-9 h-9` |
| ShotDirectionSelector icons | `w-5 h-5` | `w-4 h-4` |
| ShotDirectionSelector gap | `gap-3` | `gap-2` |
| **Club select buttons** (Tee/Approach/Scramble) | `h-14` | `h-11` |
| **Club drawer grid buttons** | `h-14` | `h-11` |
| **Section vertical spacing** | `space-y-8` | `space-y-6` |
| **Section internal spacing** | `space-y-3` | `space-y-2` |
| **Hole info card padding** | `p-6` mb-6 | `p-4` mb-4 |
| Hole/Par numbers | `text-5xl` | `text-4xl` |
| Yards number | `text-3xl` | `text-2xl` |
| **Prev/Next nav buttons** | `h-14` mt-8 mb-6 | `h-11` mt-5 mb-4 |
| Header padding | `pt-8 pb-6` | `pt-6 pb-4` |

Labels stay at `text-sm` (already small and important for legibility). Border radii stay the same so the visual style is preserved — just more compact.

## Files Changed

| File | Change |
|---|---|
| `src/pages/Round.tsx` | Apply size tokens above to `NumberStepper`, `ToggleButton`, `ShotDirectionSelector`, club buttons, hole-info card, header, and nav buttons |
| `src/pages/EditRound.tsx` | Same edits, mirrored to maintain parity |
| `src/components/ClubSelectorDrawer.tsx` | Shrink grid buttons from `h-14` → `h-11` |

## Technical Notes
- Pure Tailwind class swaps — no logic changes.
- Smallest touch target after the change is **36px** (`h-9`) for the Yes/No toggles and direction circles. This is below Apple's 44px guideline; if you'd prefer to keep all touch targets at `h-11` (44px) we can bump those up. Going as small as `h-9` is what's needed to actually hit a true ~25% reduction across the board.
- No changes to data flow, validation, or auto-save behavior.
- Mobile viewport (390px) was used as the design reference.

