

## Add Share Graphic Button to Completed Rounds

### Overview
Add a small share icon next to the edit (pencil) icon on each completed round in the Home page. Tapping it will fetch the full hole stats for that round and open the Round Summary Modal, allowing the user to save or share the graphic at any time.

### User Experience
Each completed round on the Home page will show two small icons on the right side:
1. Pencil icon (existing) - edit the round
2. Share icon (new) - generate and view the social graphic

### Changes

**Modified file: `src/pages/Home.tsx`**
- Add a `Share2` icon import from lucide-react
- Add state for the selected round's summary data (`selectedRoundSummary`) and a loading state
- When the share icon is tapped, fetch the full `hole_stats` for that round from the database (score, par, fir, gir, scramble, putts)
- Once loaded, open the `RoundSummaryModal` with the fetched data, course name, total score, and played date
- Replace the current hardcoded preview `RoundSummaryModal` (and remove the "Preview Summary Graphic" button) with this dynamic one
- Add the share icon button below or next to the existing pencil icon in the recent rounds list

### Technical Details
- The existing completed rounds query only fetches `hole_stats(par)`. Rather than making that query heavier for all rounds, the full hole stats will be fetched on-demand when the user taps the share icon.
- Query: `supabase.from('hole_stats').select('score, par, fir, gir, scramble, putts').eq('round_id', roundId).order('hole_number')`
- The `HoleData` interface in `RoundSummaryModal` expects: `score`, `fir`, `gir`, `scramble` ('yes'/'no'/'n/a'/null), `putts`, and `par` -- all of which are available in the `hole_stats` table.
- A loading toast or spinner will show briefly while fetching the data.

