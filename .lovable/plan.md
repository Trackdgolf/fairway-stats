

# Fix Par 3 Hole Detail: Show Approach Data as Tee Shot

## Problem
For par 3 holes, the tee shot club is stored in `approach_club` (not `tee_club`), and FIR data is null — the shot outcome is in `gir`/`gir_direction` instead. This is by design for other parts of the app, but means the Hole Detail view shows "—" for club and "No data" for the tee result on par 3s.

## Changes

### 1. Update `src/hooks/useHoleHistory.ts`
- Also select `approach_club`, `gir`, and `gir_direction` from `hole_stats`
- Add these to the `HolePlay` interface (or derive them inline)
- For par 3 holes (`par === 3`): use `approach_club` as `teeClub`, and `gir`/`gir_direction` as `fir`/`firDirection`
- For non-par-3 holes: keep existing behavior unchanged

### 2. Update `src/components/HoleDetail.tsx`
- For par 3 holes, relabel the tee result row — instead of FIR terminology ("Fairway Hit"/"Missed Left"), use GIR terminology ("Green Hit"/"Missed Left"/"Missed Right")
- Change the icon label contextually: show "Green Hit" instead of "Fairway Hit" when par is 3

No other files are affected — this is fully isolated to the Hole Detail view.

| File | Change |
|------|--------|
| `src/hooks/useHoleHistory.ts` | Select `approach_club`, `gir`, `gir_direction`; swap them in for par 3 holes |
| `src/components/HoleDetail.tsx` | Show "Green Hit" instead of "Fairway Hit" for par 3 tee results |

