import { ChallengeGroup } from "@/hooks/useAchievements";

// ── Country → Continent mapping ─────────────────────────────────────────────
const CONTINENT_MAP: Record<string, string> = {
  // Europe
  "United Kingdom": "Europe", "England": "Europe", "Scotland": "Europe", "Wales": "Europe",
  "Northern Ireland": "Europe", "Ireland": "Europe", "France": "Europe", "Germany": "Europe",
  "Spain": "Europe", "Portugal": "Europe", "Italy": "Europe", "Netherlands": "Europe",
  "Belgium": "Europe", "Sweden": "Europe", "Norway": "Europe", "Denmark": "Europe",
  "Finland": "Europe", "Iceland": "Europe", "Austria": "Europe", "Switzerland": "Europe",
  "Czech Republic": "Europe", "Poland": "Europe", "Greece": "Europe", "Turkey": "Europe",
  "Croatia": "Europe", "Romania": "Europe", "Hungary": "Europe", "Bulgaria": "Europe",
  "Slovakia": "Europe", "Slovenia": "Europe", "Estonia": "Europe", "Latvia": "Europe",
  "Lithuania": "Europe", "Luxembourg": "Europe", "Malta": "Europe", "Cyprus": "Europe",
  "Serbia": "Europe", "Montenegro": "Europe", "Bosnia and Herzegovina": "Europe",
  "North Macedonia": "Europe", "Albania": "Europe", "Moldova": "Europe", "Ukraine": "Europe",
  "Belarus": "Europe", "Russia": "Europe",
  // North America
  "United States": "North America", "USA": "North America", "Canada": "North America",
  "Mexico": "North America", "Costa Rica": "North America", "Jamaica": "North America",
  "Dominican Republic": "North America", "Puerto Rico": "North America",
  "Bahamas": "North America", "Barbados": "North America", "Trinidad and Tobago": "North America",
  "Guatemala": "North America", "Honduras": "North America", "Panama": "North America",
  "Cuba": "North America", "Nicaragua": "North America", "El Salvador": "North America",
  "Haiti": "North America", "Belize": "North America",
  // South America
  "Brazil": "South America", "Argentina": "South America", "Chile": "South America",
  "Colombia": "South America", "Peru": "South America", "Uruguay": "South America",
  "Venezuela": "South America", "Ecuador": "South America", "Bolivia": "South America",
  "Paraguay": "South America", "Guyana": "South America", "Suriname": "South America",
  // Asia
  "Japan": "Asia", "South Korea": "Asia", "China": "Asia", "India": "Asia",
  "Thailand": "Asia", "Vietnam": "Asia", "Indonesia": "Asia", "Philippines": "Asia",
  "Malaysia": "Asia", "Singapore": "Asia", "UAE": "Asia", "United Arab Emirates": "Asia",
  "Saudi Arabia": "Asia", "Qatar": "Asia", "Bahrain": "Asia", "Oman": "Asia",
  "Kuwait": "Asia", "Israel": "Asia", "Jordan": "Asia", "Lebanon": "Asia",
  "Sri Lanka": "Asia", "Nepal": "Asia", "Bangladesh": "Asia", "Pakistan": "Asia",
  "Myanmar": "Asia", "Cambodia": "Asia", "Laos": "Asia", "Mongolia": "Asia",
  "Taiwan": "Asia", "Hong Kong": "Asia", "Macau": "Asia",
  // Africa
  "South Africa": "Africa", "Morocco": "Africa", "Egypt": "Africa", "Kenya": "Africa",
  "Nigeria": "Africa", "Ghana": "Africa", "Tanzania": "Africa", "Uganda": "Africa",
  "Mauritius": "Africa", "Tunisia": "Africa", "Senegal": "Africa", "Zimbabwe": "Africa",
  "Botswana": "Africa", "Zambia": "Africa", "Mozambique": "Africa", "Rwanda": "Africa",
  "Ethiopia": "Africa", "Namibia": "Africa", "Cameroon": "Africa",
  // Oceania
  "Australia": "Oceania", "New Zealand": "Oceania", "Fiji": "Oceania",
  "Papua New Guinea": "Oceania", "Samoa": "Oceania", "Tonga": "Oceania",
  "New Caledonia": "Oceania", "Guam": "Oceania",
};

export const getContinent = (country: string): string | null =>
  CONTINENT_MAP[country] ?? null;

// ── Per-round hole data used by buildUserStats ──────────────────────────────
export interface RoundHoleData {
  hole_number: number;
  score: number | null;
  par: number | null;
  fir: boolean | null;
  gir: boolean | null;
  putts: number | null;
  scramble: string | null;
  scramble_shot_type: string | null;
  penalties: number | null;
}

// ── UserStats – everything challenges need ──────────────────────────────────
export interface UserStats {
  totalRounds: number;
  bestScore: number | null;
  bestOverPar: number | null;
  totalBirdies: number;
  totalEagles: number;
  totalAlbatrosses: number;
  totalHolesInOne: number;
  totalPars: number;
  totalBogeys: number;
  totalDoubleBogeys: number;
  totalFairwaysHit: number;
  totalFairwaysAttempted: number;
  totalGreensHit: number;
  totalGreensAttempted: number;
  totalPutts: number;
  totalHolesPlayed: number;
  totalDistanceMiles: number;
  bestPuttingRound: number | null;
  totalScrambleSaves: number;
  totalScrambleAttempts: number;
  bestFirPercentInRound: number | null;
  bestGirPercentInRound: number | null;

  // Distinct courses / countries / continents
  distinctCourseCount: number;
  distinctCountries: string[];
  distinctContinents: string[];

  // Per-round booleans / detections
  hasBackToBackBirdies: boolean;
  hasBounceBack: boolean;
  hasEvenFront9: boolean;
  hasEvenBack9: boolean;
  hasUnderParPar5sInRound: boolean;
  hasUnderParFront9: boolean;
  hasUnderParBack9: boolean;
  hasDoubleBogeyFreeRound: boolean;
  hasUnderParPar3sInRound: boolean;
  hasUnderParPar4sInRound: boolean;
  hasScratchRound: boolean;
  hasUnderParRound: boolean;
  hasBogeyFreeRound: boolean;
  hasDialledRound: boolean; // 100% FIR + GIR
  hasBirdieAllPar3sInRound: boolean;
  hasEaglePar4: boolean;
  hasNo3PuttRound: boolean;
  hasChipHoleOut: boolean;
  hasPitchHoleOut: boolean;
  hasBunkerHoleOut: boolean;
  hasSandyLyle: boolean;     // bunker + 1 putt
  hasPitchPlease: boolean;   // pitch + 1 putt
  hasFishAndChips: boolean;  // chip + 1 putt
  hasSnowman: boolean;       // score of 8
  hasDoubleDigits: boolean;  // score >= 10
  has4PlusPutt: boolean;
  has0FirRound: boolean;
  has0GirRound: boolean;
  hasBackToBackDoubles: boolean;
  hasFalseStart: boolean;    // birdie then double+
  hasSlowStart: boolean;     // double+ on hole 1
  hasFinishingWhimper: boolean; // double+ on hole 18
  hasPenaltyPrincess: boolean; // 5+ penalties in a round
  hasMakingSandcastles: boolean; // 5+ bunker shots in a round
}

// ── Challenge evaluation types ──────────────────────────────────────────────
export interface ChallengeEvalResult {
  isCompleted: boolean;
  progress: number;
  target: number;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  group: ChallengeGroup;
  sequence?: string;
  sequenceOrder?: number;
  evaluate: (stats: UserStats) => ChallengeEvalResult;
}

// ── Helper for simple threshold challenges ──────────────────────────────────
const threshold = (
  id: string, title: string, description: string, group: ChallengeGroup,
  getValue: (s: UserStats) => number, target: number
): ChallengeDefinition => ({
  id, title, description, group,
  evaluate: (s) => ({ isCompleted: getValue(s) >= target, progress: Math.min(getValue(s), target), target }),
});

const boolChallenge = (
  id: string, title: string, description: string, group: ChallengeGroup,
  check: (s: UserStats) => boolean
): ChallengeDefinition => ({
  id, title, description, group,
  evaluate: (s) => ({ isCompleted: check(s), progress: check(s) ? 1 : 0, target: 1 }),
});

// ── Score Challenges (12) ───────────────────────────────────────────────────
const scoreChallenges: ChallengeDefinition[] = [
  {
    id: "welcome-to-the-90s",
    title: "Welcome to the 90's",
    description: "Break 100",
    group: "score",
    evaluate: (s) => ({
      isCompleted: s.bestScore !== null && s.bestScore < 100,
      progress: s.bestScore !== null ? Math.min(s.bestScore, 100) : 0,
      target: 100,
    }),
  },
  {
    id: "welcome-to-the-80s",
    title: "Welcome to the 80's",
    description: "Break 90",
    group: "score",
    evaluate: (s) => ({
      isCompleted: s.bestScore !== null && s.bestScore < 90,
      progress: s.bestScore !== null ? Math.min(s.bestScore, 90) : 0,
      target: 90,
    }),
  },
  {
    id: "scratch-ish",
    title: "Scratch-ish",
    description: "Break 80",
    group: "score",
    evaluate: (s) => ({
      isCompleted: s.bestScore !== null && s.bestScore < 80,
      progress: s.bestScore !== null ? Math.min(s.bestScore, 80) : 0,
      target: 80,
    }),
  },
  {
    id: "flirting-with-par",
    title: "Flirting with Par",
    description: "Break 75",
    group: "score",
    evaluate: (s) => ({
      isCompleted: s.bestScore !== null && s.bestScore < 75,
      progress: s.bestScore !== null ? Math.min(s.bestScore, 75) : 0,
      target: 75,
    }),
  },
  boolChallenge("even-9", "Even 9", "Shoot Level Par over 9 holes (front 9 or back 9)", "score",
    (s) => s.hasEvenFront9 || s.hasEvenBack9),
  boolChallenge("back-to-back-birds", "Back to Back Birds", "Record back to back birdies", "score",
    (s) => s.hasBackToBackBirdies),
  boolChallenge("bounce-back", "Bounce Back", "Record a birdie on the next hole after recording a bogey or worse", "score",
    (s) => s.hasBounceBack),
  boolChallenge("easy-peasy-par-5s", "Easy peasy Par 5's", "Under par on the Par 5's (18 holes)", "score",
    (s) => s.hasUnderParPar5sInRound),
  boolChallenge("par-breakers", "Par Breakers", "Shoot under par - 9 holes", "score",
    (s) => s.hasUnderParFront9 || s.hasUnderParBack9),
  boolChallenge("bogeys-or-better", "Bogeys or Better", "Double Bogey Free Round (18 holes)", "score",
    (s) => s.hasDoubleBogeyFreeRound),
  boolChallenge("easy-peasy-par-3s", "Easy Peasy Par 3's", "Under Par on par 3s (18 holes)", "score",
    (s) => s.hasUnderParPar3sInRound),
  boolChallenge("easy-peasy-par-4s", "Easy Peasy Par 4's", "Under Par on the par 4's (18 holes)", "score",
    (s) => s.hasUnderParPar4sInRound),
];

// ── Rounds Challenges (10) ──────────────────────────────────────────────────
const roundsChallenges: ChallengeDefinition[] = [
  { ...threshold("welcome-friend", "Welcome friend", "Play 1 Round", "rounds", (s) => s.totalRounds, 1), sequence: "rounds-played", sequenceOrder: 1 },
  { ...threshold("fun-right", "Fun Right?", "Play 10 Rounds", "rounds", (s) => s.totalRounds, 10), sequence: "rounds-played", sequenceOrder: 2 },
  { ...threshold("someones-getting-addicted", "Someones getting addicted…", "Play 25 Rounds", "rounds", (s) => s.totalRounds, 25), sequence: "rounds-played", sequenceOrder: 3 },
  { ...threshold("theres-no-stopping-you", "There's no stopping you!", "Play 50 Rounds", "rounds", (s) => s.totalRounds, 50), sequence: "rounds-played", sequenceOrder: 4 },
  { ...threshold("serious-dedication", "Serious Dedication", "Play 75 Rounds", "rounds", (s) => s.totalRounds, 75), sequence: "rounds-played", sequenceOrder: 5 },
  { ...threshold("triple-digits", "Triple Digits!", "Play 100 Rounds", "rounds", (s) => s.totalRounds, 100), sequence: "rounds-played", sequenceOrder: 6 },
  { ...threshold("course-collector", "Course Collector", "Play 5 Different courses", "rounds", (s) => s.distinctCourseCount, 5), sequence: "courses-played", sequenceOrder: 1 },
  { ...threshold("course-connoisseur", "Course Connoisseur", "Play 10 Different courses", "rounds", (s) => s.distinctCourseCount, 10), sequence: "courses-played", sequenceOrder: 2 },
  { ...threshold("well-travelled", "Well Travelled", "Play 25 Different courses", "rounds", (s) => s.distinctCourseCount, 25), sequence: "courses-played", sequenceOrder: 3 },
  threshold("tee-time-tourist", "Tee-time tourist", "Play in 3 different countries", "rounds", (s) => s.distinctCountries.length, 3),
];

// ── Accuracy Challenges (6) ─────────────────────────────────────────────────
const accuracyChallenges: ChallengeDefinition[] = [
  boolChallenge("green-machine", "Green Machine", "100% Greens in a single 18 hole round", "accuracy",
    (s) => s.bestGirPercentInRound !== null && s.bestGirPercentInRound >= 100),
  boolChallenge("drivers-license", "Drivers License", "100% Fairways in a single 18 hole round", "accuracy",
    (s) => s.bestFirPercentInRound !== null && s.bestFirPercentInRound >= 100),
  boolChallenge("mostly-middle", "Mostly Middle", "Hit more than 50% of Fairways in a single round", "accuracy",
    (s) => s.bestFirPercentInRound !== null && s.bestFirPercentInRound > 50),
  boolChallenge("greenlight", "Greenlight", "Hit more than 50% of Greens in a single round", "accuracy",
    (s) => s.bestGirPercentInRound !== null && s.bestGirPercentInRound > 50),
  boolChallenge("stripe-show", "Stripe Show", "Hit more than 75% of Fairways in a single round", "accuracy",
    (s) => s.bestFirPercentInRound !== null && s.bestFirPercentInRound > 75),
  boolChallenge("dancefloor-diva", "Dancefloor Diva", "Hit more than 75% of Greens in a single round", "accuracy",
    (s) => s.bestGirPercentInRound !== null && s.bestGirPercentInRound > 75),
];

// ── Short Game Challenges (11) ──────────────────────────────────────────────
const shortGameChallenges: ChallengeDefinition[] = [
  boolChallenge("drive-for-show", "Drive for show Putt for Dough", "No 3 putts in a round", "short-game",
    (s) => s.hasNo3PuttRound),
  boolChallenge("chip-and-dip", "Chip & Dip", "Hole Out when chipping", "short-game",
    (s) => s.hasChipHoleOut),
  boolChallenge("pitch-perfect", "Pitch Perfect", "Hole out when Pitching", "short-game",
    (s) => s.hasPitchHoleOut),
  boolChallenge("beach-babe", "Beach Babe", "Hole out from the sand", "short-game",
    (s) => s.hasBunkerHoleOut),
  boolChallenge("sandy-lyle", "Sandy Lyle", "Up n down from a bunker", "short-game",
    (s) => s.hasSandyLyle),
  boolChallenge("pitch-please", "Pitch, Please", "Up n down from a pitch", "short-game",
    (s) => s.hasPitchPlease),
  boolChallenge("fish-and-chips", "Fish and Chips", "Up n down from a chip", "short-game",
    (s) => s.hasFishAndChips),
  { ...threshold("short-game-pro", "Short Game Pro", "Record 10 up n downs", "short-game", (s) => s.totalScrambleSaves, 10), sequence: "scramble-saves", sequenceOrder: 1 },
  { ...threshold("short-game-hero", "Short Game Hero", "Record 25 up n downs", "short-game", (s) => s.totalScrambleSaves, 25), sequence: "scramble-saves", sequenceOrder: 2 },
  { ...threshold("short-game-legend", "Short Game Legend", "Record 50 up n downs", "short-game", (s) => s.totalScrambleSaves, 50), sequence: "scramble-saves", sequenceOrder: 3 },
  { ...threshold("short-game-god", "Short Game God", "Record 100 up n downs", "short-game", (s) => s.totalScrambleSaves, 100), sequence: "scramble-saves", sequenceOrder: 4 },
];

// ── GOAT Challenges (11) ────────────────────────────────────────────────────
const goatChallenges: ChallengeDefinition[] = [
  {
    id: "6-and-9-anyway-up",
    title: "6 & 9 anyway up",
    description: "Shoot Under 70 for 18 holes",
    group: "goat",
    evaluate: (s) => ({
      isCompleted: s.bestScore !== null && s.bestScore < 70,
      progress: s.bestScore !== null ? Math.min(s.bestScore, 70) : 0,
      target: 70,
    }),
  },
  boolChallenge("scratch", "Scratch", "Shoot Level par", "goat",
    (s) => s.hasScratchRound),
  boolChallenge("ready-to-turn-pro", "Ready to turn Pro?", "Break Level Par", "goat",
    (s) => s.hasUnderParRound),
  {
    id: "mr-worldwide",
    title: "Mr Worldwide",
    description: "Record a round on all 6 continents",
    group: "goat",
    evaluate: (s) => ({
      isCompleted: s.distinctContinents.length >= 6,
      progress: s.distinctContinents.length,
      target: 6,
    }),
  },
  { ...threshold("i-didnt-think-this-was-possible", "I didn't think this was possible!", "Play 200 Rounds", "goat",
    (s) => s.totalRounds, 200), sequence: "rounds-played", sequenceOrder: 7 },
  boolChallenge("thats-gonna-be-expensive", "That's gonna be expensive $$", "Record a Hole In One", "goat",
    (s) => s.totalHolesInOne > 0),
  boolChallenge("dialled", "Dialled", "Hit all fairways and greens in a single round", "goat",
    (s) => s.hasDialledRound),
  boolChallenge("2s", "2's", "Birdie all par 3s in a single round", "goat",
    (s) => s.hasBirdieAllPar3sInRound),
  boolChallenge("boogeyman-dont-scare-me", "Boogeyman don't scare me", "Bogey free round", "goat",
    (s) => s.hasBogeyFreeRound),
  boolChallenge("big-bird-on-a-4", "Big Bird on a 4!", "Eagle a par 4", "goat",
    (s) => s.hasEaglePar4),
  {
    id: "1000-miles-club",
    title: "1000 miles club",
    description: "1000 miles",
    group: "goat",
    sequence: "distance",
    sequenceOrder: 14,
    evaluate: (s) => ({
      isCompleted: s.totalDistanceMiles >= 1000,
      progress: Math.min(s.totalDistanceMiles, 1000),
      target: 1000,
    }),
  },
];

// ── Hidden Challenges (11) ──────────────────────────────────────────────────
const hiddenChallenges: ChallengeDefinition[] = [
  boolChallenge("snowman", "Snowman", "Record an 8", "hidden", (s) => s.hasSnowman),
  boolChallenge("double-digits", "Double Digits", "Record a 10 or more on a single hole", "hidden", (s) => s.hasDoubleDigits),
  boolChallenge("penalty-princess", "Penalty Princess", "5 or more penalties in a single round", "hidden", (s) => s.hasPenaltyPrincess),
  boolChallenge("making-sandcastles", "Making Sandcastles", "5 or more bunkers in a single round", "hidden", (s) => s.hasMakingSandcastles),
  boolChallenge("this-aint-mini-golf", "This ain't mini-golf", "4+ Putt", "hidden", (s) => s.has4PlusPutt),
  boolChallenge("wilderness-explorer", "Wilderness Explorer", "0% Fairways", "hidden", (s) => s.has0FirRound),
  boolChallenge("i-prefer-to-chip", "I prefer to chip", "0% Greens", "hidden", (s) => s.has0GirRound),
  boolChallenge("back-breaking-work", "Back Breaking Work", "Back to Back doubles+", "hidden", (s) => s.hasBackToBackDoubles),
  boolChallenge("false-start", "False Start", "Birdie to double", "hidden", (s) => s.hasFalseStart),
  boolChallenge("slow-start", "Slow Start", "Double Bogey or Worst on First Hole", "hidden", (s) => s.hasSlowStart),
  boolChallenge("finishing-with-a-whimper", "Finishing with a whimper", "Double Bogey or Worst on Last Hole", "hidden", (s) => s.hasFinishingWhimper),
];

// ── Distance Challenges (13) ────────────────────────────────────────────────
const distanceChallenges: ChallengeDefinition[] = [
  { ...threshold("half-marathon", "Half Marathon", "13.1 Miles", "distance", (s) => s.totalDistanceMiles, 13.1), sequence: "distance", sequenceOrder: 1 },
  { ...threshold("marathon", "Marathon", "26.2 Miles", "distance", (s) => s.totalDistanceMiles, 26.2), sequence: "distance", sequenceOrder: 2 },
  { ...threshold("ultra-marathon", "Ultra Marathon", "50 Miles", "distance", (s) => s.totalDistanceMiles, 50), sequence: "distance", sequenceOrder: 3 },
  { ...threshold("hadrians-wall", "Hadrians Wall", "73 Miles", "distance", (s) => s.totalDistanceMiles, 73), sequence: "distance", sequenceOrder: 4 },
  { ...threshold("100-miler", "100 Miler", "100 Miles", "distance", (s) => s.totalDistanceMiles, 100), sequence: "distance", sequenceOrder: 5 },
  { ...threshold("m25-lap", "M25 Lap", "117 Miles", "distance", (s) => s.totalDistanceMiles, 117), sequence: "distance", sequenceOrder: 6 },
  { ...threshold("offas-dyke-path", "Offa's Dyke Path", "177 miles", "distance", (s) => s.totalDistanceMiles, 177), sequence: "distance", sequenceOrder: 7 },
  { ...threshold("coast-to-coast", "Coast to Coast (Wainwright)", "190 miles", "distance", (s) => s.totalDistanceMiles, 190), sequence: "distance", sequenceOrder: 8 },
  { ...threshold("london-to-paris", "London to Paris", "214 miles", "distance", (s) => s.totalDistanceMiles, 214), sequence: "distance", sequenceOrder: 9 },
  { ...threshold("london-to-home-of-golf", "London to the Home of Golf", "351.5 miles", "distance", (s) => s.totalDistanceMiles, 351.5), sequence: "distance", sequenceOrder: 10 },
  { ...threshold("500-miles-club", "500 miles club", "500 Miles", "distance", (s) => s.totalDistanceMiles, 500), sequence: "distance", sequenceOrder: 11 },
  { ...threshold("south-west-coastal-path", "South West Coastal Path", "630 Miles", "distance", (s) => s.totalDistanceMiles, 630), sequence: "distance", sequenceOrder: 12 },
  { ...threshold("lejog", "LEJOG", "874 miles", "distance", (s) => s.totalDistanceMiles, 874), sequence: "distance", sequenceOrder: 13 },
];

// ── Export all 74 ───────────────────────────────────────────────────────────
export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  ...roundsChallenges,
  ...scoreChallenges,
  ...accuracyChallenges,
  ...shortGameChallenges,
  ...goatChallenges,
  ...hiddenChallenges,
  ...distanceChallenges,
];
