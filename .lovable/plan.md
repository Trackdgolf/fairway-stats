
# Standardise Challenge Description Capitalisation

## Overview
Update all challenge descriptions in `src/lib/challengeDefinitions.ts` to use sentence case -- only the first word capitalised (plus proper nouns like "Par", "Greens", "Fairways", "Miles" where they refer to golf-specific terms).

## Changes needed in `src/lib/challengeDefinitions.ts`

Here are all descriptions that need updating (current -> new):

**Score challenges:**
- "Break 100" - OK
- "Break 90" - OK
- "Break 80" - OK
- "Break 75" - OK
- "Shoot Level Par over 9 holes (front 9 or back 9)" -> "Shoot level par over 9 holes (front 9 or back 9)"
- "Record back to back birdies" - OK
- "Record a birdie on the next hole after recording a bogey or worse" - OK
- "Under par on the Par 5's (18 holes)" -> "Under par on the par 5's (18 holes)"
- "Shoot under par - 9 holes" - OK
- "Double Bogey Free Round (18 holes)" -> "Double bogey free round (18 holes)"
- "Under Par on par 3s (18 holes)" -> "Under par on par 3s (18 holes)"
- "Under Par on the par 4's (18 holes)" -> "Under par on the par 4's (18 holes)"

**Rounds challenges:**
- "Play 1 Round" -> "Play 1 round"
- "Play 10 Rounds" -> "Play 10 rounds"
- "Play 25 Rounds" -> "Play 25 rounds"
- "Play 50 Rounds" -> "Play 50 rounds"
- "Play 75 Rounds" -> "Play 75 rounds"
- "Play 100 Rounds" -> "Play 100 rounds"
- "Play 5 Different courses" -> "Play 5 different courses"
- "Play 10 Different courses" -> "Play 10 different courses"
- "Play 25 Different courses" -> "Play 25 different courses"
- "Play in 3 different countries" - OK

**Accuracy challenges:**
- "100% Greens in a single 18 hole round" -> "100% greens in a single 18 hole round"
- "100% Fairways in a single 18 hole round" -> "100% fairways in a single 18 hole round"
- "Hit more than 50% of Fairways in a single round" -> "Hit more than 50% of fairways in a single round"
- "Hit more than 50% of Greens in a single round" -> "Hit more than 50% of greens in a single round"
- "Hit more than 75% of Fairways in a single round" -> "Hit more than 75% of fairways in a single round"
- "Hit more than 75% of Greens in a single round" -> "Hit more than 75% of greens in a single round"

**Short game challenges:**
- "No 3 putts in a round" - OK
- "Hole Out when chipping" -> "Hole out when chipping"
- "Hole out when Pitching" -> "Hole out when pitching"
- "Hole out from the sand" - OK
- "Up n down from a bunker" - OK
- "Up n down from a pitch" - OK
- "Up n down from a chip" - OK
- "Record 10 up n downs" - OK
- "Record 25 up n downs" - OK
- "Record 50 up n downs" - OK
- "Record 100 up n downs" - OK

**GOAT challenges:**
- "Shoot Under 70 for 18 holes" -> "Shoot under 70 for 18 holes"
- "Shoot Level par" -> "Shoot level par"
- "Break Level Par" -> "Break level par"
- "Record a round on all 6 continents" - OK
- "Play 200 Rounds" -> "Play 200 rounds"
- "Record a Hole In One" -> "Record a hole in one"
- "Hit all fairways and greens in a single round" - OK
- "Birdie all par 3s in a single round" - OK
- "Bogey free round" - OK
- "Eagle a par 4" - OK
- "1000 miles" - OK

**Hidden challenges:**
- "Record an 8" - OK
- "Record a 10 or more on a single hole" - OK
- "5 or more penalties in a single round" - OK
- "5 or more bunkers in a single round" - OK
- "4+ Putt" -> "4+ putt"
- "0% Fairways" -> "0% fairways"
- "0% Greens" -> "0% greens"
- "Back to Back doubles+" -> "Back to back doubles+"
- "Birdie to double" - OK
- "Double Bogey or Worst on First Hole" -> "Double bogey or worse on first hole"
- "Double Bogey or Worst on Last Hole" -> "Double bogey or worse on last hole"

**Distance challenges:**
- "13.1 Miles" -> "13.1 miles"
- "26.2 Miles" -> "26.2 miles"
- "50 Miles" -> "50 miles"
- "73 Miles" -> "73 miles"
- "100 Miles" -> "100 miles"
- "117 Miles" -> "117 miles"
- "177 miles" - OK
- "190 miles" - OK
- "214 miles" - OK
- "351.5 miles" - OK
- "500 Miles" -> "500 miles"
- "630 Miles" -> "630 miles"
- "874 miles" - OK

## Technical details
- Single file change: `src/lib/challengeDefinitions.ts`
- Approximately 40 description strings to update
- No logic changes, purely cosmetic text updates
