
# Standardise Challenge Titles to Title Case

## Overview
Update challenge titles in `src/lib/challengeDefinitions.ts` so every word starts with a capital letter (Title Case), matching the majority of existing titles.

## Titles that need updating (current -> new)

**Rounds:**
- "Welcome friend" -> "Welcome Friend"
- "Someones getting addicted..." -> "Someones Getting Addicted..."
- "Tee-time tourist" -> "Tee-Time Tourist"

**Score:**
- "Easy peasy Par 5's" -> "Easy Peasy Par 5's"

**Short Game:**
- "Drive for show Putt for Dough" -> "Drive For Show Putt For Dough"

**GOAT:**
- "6 & 9 anyway up" -> "6 & 9 Anyway Up"
- "Ready to turn Pro?" -> "Ready To Turn Pro?"
- "That's gonna be expensive $$" -> "That's Gonna Be Expensive $$"
- "Boogeyman don't scare me" -> "Boogeyman Don't Scare Me"
- "I didn't think this was possible!" -> "I Didn't Think This Was Possible!"
- "1000 miles club" -> "1000 Miles Club"

**Hidden:**
- "This ain't mini-golf" -> "This Ain't Mini-Golf"
- "I prefer to chip" -> "I Prefer To Chip"
- "Finishing with a whimper" -> "Finishing With A Whimper"

**Distance:**
- "London to the Home of Golf" -> "London To The Home Of Golf"
- "500 miles club" -> "500 Miles Club"

## Technical details
- Single file change: `src/lib/challengeDefinitions.ts`
- 15 title strings to update
- No logic changes, purely cosmetic text updates
