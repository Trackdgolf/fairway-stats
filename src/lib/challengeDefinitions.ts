import { ChallengeGroup } from "@/hooks/useAchievements";

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
  totalDistanceKm: number;
  bestPuttingRound: number | null;
  totalScrambleSaves: number;
  totalScrambleAttempts: number;
  bestFirPercentInRound: number | null;
  bestGirPercentInRound: number | null;
}

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
  evaluate: (stats: UserStats) => ChallengeEvalResult;
}

const scoreChallenges: ChallengeDefinition[] = [
  {
    id: "break-100",
    title: "Break 100",
    description: "Shoot under 100 in a round",
    group: "score",
    evaluate: (stats) => ({
      isCompleted: stats.bestScore !== null && stats.bestScore < 100,
      progress: stats.bestScore !== null ? Math.min(stats.bestScore, 100) : 0,
      target: 100,
    }),
  },
  {
    id: "break-90",
    title: "Break 90",
    description: "Shoot under 90 in a round",
    group: "score",
    evaluate: (stats) => ({
      isCompleted: stats.bestScore !== null && stats.bestScore < 90,
      progress: stats.bestScore !== null ? Math.min(stats.bestScore, 90) : 0,
      target: 90,
    }),
  },
  {
    id: "break-80",
    title: "Break 80",
    description: "Shoot under 80 in a round",
    group: "score",
    evaluate: (stats) => ({
      isCompleted: stats.bestScore !== null && stats.bestScore < 80,
      progress: stats.bestScore !== null ? Math.min(stats.bestScore, 80) : 0,
      target: 80,
    }),
  },
  {
    id: "break-70",
    title: "Break 70",
    description: "Shoot under 70 in a round",
    group: "score",
    evaluate: (stats) => ({
      isCompleted: stats.bestScore !== null && stats.bestScore < 70,
      progress: stats.bestScore !== null ? Math.min(stats.bestScore, 70) : 0,
      target: 70,
    }),
  },
];

export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  ...scoreChallenges,
];