## Putting Performance Tab + Per-Putt Tracking

### What you'll see

**On the Club Performance page** — a new "Putting" tab next to Tee Shots / Approach / Scramble (premium-only, matching the rest of the page).

It shows your putting outcomes broken down by 4 distance buckets:

- **0–3 ft** • **4–8 ft** • **9–14 ft** • **15 ft+**

For each bucket you'll see:
- Total putts attempted
- Make % (holed)
- Outcome breakdown: **Holed / Short / Long / Left / Right / Lipped Out**

A placeholder area at the top is reserved for the putting-green graphic you'll add later. The same time-range filter (Last Round / 3M / 6M / 1Y / All Time) used by the other tabs applies here too.

**On the round entry screen (and Edit Round)** — directly next to the Putts stepper, a small "Track each putt" toggle button appears once putts > 0. Tapping it opens an inline panel with one row per putt:

```
Putt 1   [0–3] [4–8] [9–14] [15+]    [Holed][Short][Long][Left][Right][Lip]
Putt 2   [0–3] [4–8] [9–14] [15+]    [Holed][Short][Long][Left][Right][Lip]
...
```

Rows automatically match the number of putts entered. If you change the putt count, rows are added/removed. Tracking is fully optional — leaving it untouched stores nothing extra and behaves exactly like today.

### How it works

**Database (new table `putt_details`)**
- `id`, `round_id` (FK), `hole_number`, `putt_index` (1-based), `distance_bucket` ('0-3' | '4-8' | '9-14' | '15+'), `outcome` ('holed' | 'short' | 'long' | 'left' | 'right' | 'lipped_out'), `created_at`
- RLS mirrors `hole_stats`: users can CRUD only when the parent round belongs to them
- Unique index on `(round_id, hole_number, putt_index)` so re-saving a hole replaces cleanly

A separate table (rather than columns on `hole_stats`) keeps the schema clean and avoids breaking the auto-save JSON shape.

**Round entry (`src/pages/Round.tsx` and `src/pages/EditRound.tsx`)**
- Extend the per-hole state with an optional `puttDetails: Array<{distance, outcome}>`
- New compact `PuttDetailEntry` component rendered conditionally next to the Putts stepper
- Auto-save into the existing `in_progress_rounds.hole_stats` JSONB (no migration needed there)
- On round completion, write rows to `putt_details` after `hole_stats` is saved
- EditRound loads existing rows and supports edit/delete to maintain strict parity

**Analytics (`src/hooks/usePuttingStats.ts`, new)**
- Mirrors `useDispersionStats` pattern: filter rounds by time range, fetch `putt_details` for those rounds, aggregate per bucket
- Returns `{ buckets: [{ bucket, total, holed, short, long, left, right, lippedOut, makePercent }] }`

**UI (`src/components/PuttingPerformance.tsx`, new)**
- Placeholder card "Putting green graphic — coming soon"
- 4 bucket cards with make % big, then horizontal outcome bar (color-coded: holed = primary green, miss directions = muted, lipped out = amber)
- "No putts tracked yet" empty state with hint to enable per-putt tracking on the entry screen

**Club Performance page**
- Add `"putting"` to `TabType`, render `<TabsTrigger value="putting">Putting</TabsTrigger>` (4-column grid)
- Putting tab hides the club filter row (not relevant); time-range select stays
- Fully covered by the existing premium overlay — no new gating logic needed

### Files

**New**
- `src/components/PuttingPerformance.tsx`
- `src/components/PuttDetailEntry.tsx`
- `src/hooks/usePuttingStats.ts`
- `supabase/migrations/<timestamp>_putt_details.sql`

**Edited**
- `src/pages/ClubPerformance.tsx` — add Putting tab + content
- `src/pages/Round.tsx` — toggle button + entry panel + save logic
- `src/pages/EditRound.tsx` — same parity additions
- `src/components/RoundSummaryModal.tsx` — minor: clean up if it references putts (no behavioural change planned)

### Out of scope (for this pass)

- The actual putting-green graphic (you'll provide later — placeholder reserved)
- Showing per-putt detail in `RoundSummaryModal` or `Stats` chart
- Achievements tied to make %
- Premium-gating changes elsewhere

### QA

1. On a round, set Putts = 3, tap "Track each putt", record three putts → save round → reload Edit Round → all three rows reappear correctly.
2. Increase putts from 2 → 4, confirm 2 new empty rows appear; decrease back to 2, confirm the extra rows are dropped.
3. Leave the toggle off on a hole and confirm the round still saves with no `putt_details` rows.
4. Open Club Performance → Putting tab → confirm 4 buckets show aggregate stats, time-range filter updates them, empty state appears for new users.
5. Confirm the Putting tab is hidden behind the same premium overlay as the other tabs (test by toggling `VITE_FORCE_PREMIUM`).
