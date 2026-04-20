

# Dynamic Streak Tile Colors Based on Progress

## Overview
Replace the per-metric color scheme on the Home page streak tiles with a single, consistent **progress-based** color system. The icon, progress bar, and "longest" text on each of the three tiles will share the same color, driven by how close the current streak is to the user's personal best.

This gives golfers an instant visual read on how they're trending, regardless of which metric they're looking at.

## Color Thresholds

Based on `pct = (current / longest) * 100`:

| Range | Color | Token | Behavior |
|---|---|---|---|
| 0% – 30% | Red | `destructive` | Static |
| 31% – 60% | Orange | `warning` (amber) → use a true orange | Static |
| 61% – 99% | Green | `success` | Static |
| 100% + (new record) | Gold | new `gold` token | Pulsing ring + animated bar |

Notes:
- "100% and above" = current streak ≥ longest = a new personal record (already detected in code as `isRecord`).
- If the user has no record yet (`longest === 0`), default to neutral muted styling (no color, no progress bar) — same as today's empty state.

## Files to change

| File | Change |
|---|---|
| `src/index.css` | Add a `--gold` HSL token (light + dark) for the new "record" state. |
| `tailwind.config.ts` | Register `gold` / `gold-foreground` colors so `text-gold`, `bg-gold`, `ring-gold/40`, `[&>div]:bg-gold` utilities work. |
| `src/pages/Home.tsx` | Remove per-tile color config. Add a helper `getStreakColor(pct, hasRecord)` returning `{ iconClass, barClass, ringClass, recordTextClass }`. Apply uniformly to all three tiles. |

## Implementation details

### 1) New gold token
In `src/index.css`, under `:root` and `.dark`, add:
```css
--gold: 45 90% 55%;          /* warm gold */
--gold-foreground: 40 30% 15%;
```

### 2) Tailwind registration
In `tailwind.config.ts`, extend `colors`:
```ts
gold: {
  DEFAULT: "hsl(var(--gold))",
  foreground: "hsl(var(--gold-foreground))",
},
```

### 3) Color helper in `Home.tsx`
Replace the existing per-tile `iconClass / barClass / ringClass / recordTextClass` with a single function:

```ts
const getStreakColor = (pct: number, hasRecord: boolean, isRecord: boolean) => {
  if (!hasRecord) {
    return { iconClass: "text-muted-foreground", barClass: "", ringClass: "", recordTextClass: "text-muted-foreground/70" };
  }
  if (isRecord) {
    return {
      iconClass: "text-gold",
      barClass: "[&>div]:bg-gold",
      ringClass: "ring-gold/50",
      recordTextClass: "text-gold",
    };
  }
  if (pct <= 30)  return { iconClass: "text-destructive", barClass: "[&>div]:bg-destructive", ringClass: "", recordTextClass: "text-muted-foreground/70" };
  if (pct <= 60)  return { iconClass: "text-orange-500",  barClass: "[&>div]:bg-orange-500",  ringClass: "", recordTextClass: "text-muted-foreground/70" };
  return            { iconClass: "text-success",     barClass: "[&>div]:bg-success",     ringClass: "", recordTextClass: "text-muted-foreground/70" };
};
```

(For "orange" we'll use the new `gold` token only for the record state; the 31–60% band will use `text-orange-500` / `bg-orange-500` from Tailwind's default palette so we don't need yet another custom token.)

### 4) Tile loop
Simplify the streak array back to just `{ icon, label, data }` for the three metrics, then in the render compute `pct` / `hasRecord` / `isRecord` and call `getStreakColor` to pull classes. Apply:
- `iconClass` → `Icon`
- `barClass` → `Progress`
- `ringClass` + `animate-pulse` → outer `Card` only when `isRecord`
- `recordTextClass` → bottom "Longest: X" / "🏆 New record!" line

### 5) Consistent behavior across tiles
All three tiles use the exact same thresholds and tokens, so a 50%-of-record streak looks the same whether it's the 3-putt, double-bogey, or penalty tile.

## Expected result
- Early in a streak run → red tile
- Building → orange
- Approaching personal best → green
- New record → pulsing gold tile
- All three tiles always use the same color rules, giving a clear at-a-glance progression cue.

## QA
1. Open Home on mobile (390 × 738).
2. Check a tile with ~25% progress → red icon + bar.
3. Check ~50% → orange.
4. Check ~80% → green.
5. Check a tile equal to longest → gold + pulse.
6. Check a tile with no record yet → neutral muted styling, no bar.
7. Toggle dark mode and confirm gold is still readable.

