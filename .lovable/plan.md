## Goal

Make the new Scorecard share-slide:
1. Fit a mobile screen with **no horizontal or vertical scroll** so the user can screenshot it cleanly.
2. Always show **Stroke Index (SI)** per hole — including when the modal is re-opened from Home for a previously played round.

---

## 1. Stroke Index — make it always available

The Golf Course API already returns `handicap` per hole, and `CourseSearch.tsx` already maps it into `course.holes[i].stroke_index`. Live rounds therefore have it. The reason the SI row shows `–` is that **historical rounds re-opened from Home read from the `hole_stats` table**, which has no `stroke_index` column.

Fix by persisting it:

- Add column `stroke_index integer NULL` to `public.hole_stats` (migration).
- In `Round.tsx` (and `EditRound.tsx` if it writes hole stats), include `stroke_index: course.holes?.[idx]?.stroke_index ?? null` in every `hole_stats` insert / upsert payload.
- In `Home.tsx` `handleShareRound`, add `stroke_index` to the `.select(...)` and pass it through as `strokeIndex` on each `holeStats` entry.
- Extend the `holeStats` type in `Home.tsx` (and the `cardProps` flow into `RoundSummaryModal`) so `strokeIndex?: number | null` is forwarded.

No backfill is needed — older rounds simply continue to show `–` for SI. Any new or edited round will save it.

---

## 2. Scorecard slide — fit mobile without scrolling

Current layout uses 4 rows × (label + 9 hole cells + total) per nine, with row paddings and gaps that push the card wider than the carousel slot, and taller than the visible modal area. Rework for a tight, fixed, screenshot-friendly design:

**Width**
- Confirm grid uses `gridTemplateColumns: 22px repeat(9, minmax(0,1fr)) 30px` and `gap-[1px]` so cells shrink to fit the carousel slide width (no horizontal overflow on a 390 px viewport).
- Reduce side padding on the slide from `p-5` to `px-3 py-4`.
- Drop cell padding to `py-[2px]` and use `text-[9px]` for header/par/SI rows, `text-[10px]` for score row. Use `tabular-nums` so 2-digit values align.

**Height**
- Tighten header block: smaller logo (`h-9`), `text-base` course name (single line, `truncate`), `text-[10px]` date, score `text-2xl`.
- Collapse spacing between the two nines (`mb-1.5`) and remove bottom margin on the last nine.
- Remove the standalone "SI" full row — instead put **SI as a tiny superscript inside each hole-header cell** (e.g. `7` with a small `· 5` underneath) so the scorecard goes from 4 rows per nine to 3. This is the key change that brings the card inside one mobile screen.
- Keep the Score row color-coded (eagle/birdie/par/bogey/double+) exactly as today.

**Result**
- Two nines stack vertically; total card height target ≈ 520 px so it fits inside `max-h-[90vh]` of the dialog (≈720 px on a 390×803 viewport) together with the title, challenges section, dots, and action buttons — no internal scroll needed.
- html2canvas export of `scorecardRef` continues to work and now produces a clean, screenshot-ready image.

---

## Technical notes

- Migration:
  ```sql
  ALTER TABLE public.hole_stats ADD COLUMN IF NOT EXISTS stroke_index integer;
  ```
  No GRANT/policy changes needed (table already configured).
- Files touched:
  - `supabase/migrations/<new>.sql`
  - `src/pages/Round.tsx` — include `stroke_index` in hole_stats writes.
  - `src/pages/EditRound.tsx` — same, if it writes hole_stats.
  - `src/pages/Home.tsx` — select + forward `stroke_index`.
  - `src/components/RoundSummaryModal.tsx` — compact `ScorecardSlide` layout (SI inline in hole-number cell, tighter typography/padding).
- No business-logic or analytics changes; this is presentation + one persisted field.
