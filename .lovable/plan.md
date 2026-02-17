

# Implementing 74 Challenges

## Overview
Add all 74 challenges across 7 categories to the achievements system. This requires expanding the data model slightly and significantly enhancing the challenge evaluation logic.

## Database Changes (2 new columns)

1. **Add `country` column to `rounds` table** - stores the country from the course API when a round is saved. Required for "Tee-time tourist" (3 countries) and "Mr Worldwide" (6 continents).

2. **Add `penalties` column to `hole_stats` table** - integer, nullable. Required for "Penalty Princess" (5+ penalties in a round). This will need a UI input on the round tracking screen.

## Code Changes

### 1. Update Round Saving (`src/pages/Round.tsx`)
- Save `country` from `course.location.country` when inserting a round
- Pass through the course location data so it's available at save time

### 2. Expand `UserStats` Interface (`src/lib/challengeDefinitions.ts`)
The current `UserStats` only tracks aggregated totals. Many challenges require per-round, hole-ordered analysis. New fields needed:

- `distinctCourseCount` - number of unique courses played
- `distinctCountries` - set of countries played in
- `distinctContinents` - set of continents played in
- Per-round hole-level data for detecting:
  - Consecutive birdies, bounce backs, back-to-back doubles
  - Front 9 / back 9 scoring vs par
  - Par-3/4/5 specific scoring per round
  - Double-bogey-free rounds, bogey-free rounds
  - Hole-outs (scramble shot type + 0 putts)
  - 3-putt free rounds, 4+ putts
  - Snowman (score of 8), double digits (score 10+)
  - First hole / last hole performance
  - 0% FIR / 0% GIR rounds

### 3. Enhance `buildUserStats` (`src/hooks/useAchievements.ts`)
- Fetch `hole_number` alongside existing hole_stats fields so holes can be ordered
- Fetch `course_id` and `country` from rounds
- Iterate through each round's holes in order to detect sequential patterns
- Calculate all the new derived stats

### 4. Add All 74 Challenge Definitions (`src/lib/challengeDefinitions.ts`)
Replace the current 4 score challenges with the full 74. Grouped by category:

**Rounds (10):** Welcome friend (1), Fun Right? (10), Someones getting addicted (25), There's no stopping you! (50), Serious Dedication (75), Triple Digits! (100), Course Collector (5 courses), Course Connoisseur (10 courses), Well Travelled (25 courses), Tee-time tourist (3 countries)

**Score (12):** Welcome to the 90's, Welcome to the 80's, Scratch-ish, Flirting with Par, Even 9, Back to Back Birds, Bounce Back, Easy peasy Par 5's, Par Breakers, Bogeys or Better, Easy Peasy Par 3's, Easy Peasy Par 4's

**Accuracy (6):** Green Machine (100% GIR), Drivers License (100% FIR), Mostly Middle (50%+ FIR), Greenlight (50%+ GIR), Stripe Show (75%+ FIR), Dancefloor Diva (75%+ GIR)

**Short Game (11):** Drive for show Putt for Dough, Chip & Dip, Pitch Perfect, Beach Babe, Sandy Lyle, Pitch Please, Fish and Chips, Short Game Pro (10), Hero (25), Legend (50), God (100)

**GOAT (11):** 6 & 9 anyway up, Scratch, Ready to turn Pro?, Mr Worldwide, I didn't think this was possible! (200 rounds), That's gonna be expensive (hole-in-one), Dialled (100% FIR + GIR), 2's (birdie all par 3s), Boogeyman don't scare me, Big Bird on a 4!, 1000 miles club

**Hidden (11):** Snowman, Double Digits, Penalty Princess, Making Sandcastles, This ain't mini-golf, Wilderness Explorer, I prefer to chip, Back Breaking Work, False Start, Slow Start, Finishing with a whimper

**Distance (13):** Half Marathon through LEJOG (13.1 to 874 miles)

## Challenges Requiring Special Attention

### Penalty Princess / Making Sandcastles
- "Penalty Princess" needs a penalty count per hole - requires a new `penalties` column and a UI input
- "Making Sandcastles" (5+ bunker shots) can be tracked via `scramble_shot_type = 'bunker'` already stored per hole, so no new column needed for this one

### Country/Continent Mapping
- A helper function will map country names to continents for the "Mr Worldwide" challenge
- Country data comes from the golf course API and will be stored on the `rounds` table

### Sequential Hole Analysis
- Challenges like "Back to Back Birds", "Bounce Back", "False Start", and "Back Breaking Work" require analysing holes in order within a single round
- The evaluation will sort holes by `hole_number` per round and check consecutive pairs

## What Won't Work Yet
- **Penalty Princess**: Will be defined but won't trigger until we add a penalty input to the round tracking UI (can be done as a follow-up)
- **Country/continent challenges**: Will work for future rounds once the `country` column is added; existing rounds won't have country data unless backfilled

## Technical Details

### Files to modify:
1. `supabase/migrations/` - new migration for `country` on rounds and `penalties` on hole_stats
2. `src/lib/challengeDefinitions.ts` - expand `UserStats`, add all 74 challenge definitions
3. `src/hooks/useAchievements.ts` - expand `buildUserStats` to compute all new stats, fetch additional columns
4. `src/pages/Round.tsx` - save `country` when completing a round

### Performance consideration:
The current approach already fetches all hole_stats for all rounds in one query (batched by 100). The additional per-round analysis will process this same data in memory -- no extra database calls needed.

