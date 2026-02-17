import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CHALLENGE_DEFINITIONS, UserStats } from "@/lib/challengeDefinitions";

export type TimeRange = "3M" | "6M" | "1Y" | "MAX";

export interface AchievementStats {
  holesInOne: number;
  albatrosses: number;
  eagles: number;
  birdies: number;
  pars: number;
  bogeys: number;
  doubleBogeys: number;
}

export type ChallengeGroup = "rounds" | "score" | "accuracy" | "short-game" | "distance" | "goat" | "hidden";

export interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  isCompleted: boolean;
  progress: number;
  group: ChallengeGroup;
}

export interface ChallengeGroupInfo {
  id: ChallengeGroup;
  title: string;
  iconName: string;
}

export const CHALLENGE_GROUPS: ChallengeGroupInfo[] = [
  { id: "rounds", title: "Rounds", iconName: "RotateCcw" },
  { id: "score", title: "Score", iconName: "Trophy" },
  { id: "accuracy", title: "Accuracy", iconName: "Crosshair" },
  { id: "short-game", title: "Short Game", iconName: "Flag" },
  { id: "distance", title: "Distance Played", iconName: "MapPin" },
  { id: "goat", title: "GOAT", iconName: "Crown" },
  { id: "hidden", title: "Hidden", iconName: "EyeOff" },
];

export interface AchievementsData {
  stats: AchievementStats;
  challenges: Challenge[];
  bestScore: number | null;
  bestOverPar: number | null;
  totalRounds: number;
}

const getDateCutoff = (timeRange: TimeRange): Date | null => {
  const now = new Date();
  switch (timeRange) {
    case "3M":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6M":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1Y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    case "MAX":
      return null;
  }
};

const buildUserStats = (
  allRounds: { id: string; total_score: number | null }[],
  allHoleStats: {
    round_id: string;
    score: number | null;
    par: number | null;
    fir: boolean | null;
    gir: boolean | null;
    putts: number | null;
    scramble: string | null;
  }[]
): UserStats => {
  let bestScore: number | null = null;
  let bestOverPar: number | null = null;
  let totalBirdies = 0;
  let totalEagles = 0;
  let totalAlbatrosses = 0;
  let totalHolesInOne = 0;
  let totalPars = 0;
  let totalBogeys = 0;
  let totalDoubleBogeys = 0;
  let totalFairwaysHit = 0;
  let totalFairwaysAttempted = 0;
  let totalGreensHit = 0;
  let totalGreensAttempted = 0;
  let totalPutts = 0;
  let totalScrambleSaves = 0;
  let totalScrambleAttempts = 0;

  const puttsByRound: Record<string, number> = {};
  const firByRound: Record<string, { hit: number; total: number }> = {};
  const girByRound: Record<string, { hit: number; total: number }> = {};

  for (const hole of allHoleStats) {
    if (hole.score !== null && hole.par !== null) {
      const diff = hole.score - hole.par;
      if (hole.score === 1) totalHolesInOne++;
      if (diff <= -3) totalAlbatrosses++;
      else if (diff === -2) totalEagles++;
      else if (diff === -1) totalBirdies++;
      else if (diff === 0) totalPars++;
      else if (diff === 1) totalBogeys++;
      else if (diff >= 2) totalDoubleBogeys++;
    }

    if (hole.fir !== null) {
      totalFairwaysAttempted++;
      if (hole.fir) totalFairwaysHit++;
      if (!firByRound[hole.round_id]) firByRound[hole.round_id] = { hit: 0, total: 0 };
      firByRound[hole.round_id].total++;
      if (hole.fir) firByRound[hole.round_id].hit++;
    }

    if (hole.gir !== null) {
      totalGreensAttempted++;
      if (hole.gir) totalGreensHit++;
      if (!girByRound[hole.round_id]) girByRound[hole.round_id] = { hit: 0, total: 0 };
      girByRound[hole.round_id].total++;
      if (hole.gir) girByRound[hole.round_id].hit++;
    }

    if (hole.putts !== null) {
      totalPutts += hole.putts;
      puttsByRound[hole.round_id] = (puttsByRound[hole.round_id] || 0) + hole.putts;
    }

    if (hole.scramble !== null) {
      totalScrambleAttempts++;
      if (hole.scramble === "yes") totalScrambleSaves++;
    }
  }

  for (const round of allRounds) {
    if (round.total_score === null) continue;
    const roundHoles = allHoleStats.filter(h => h.round_id === round.id && h.par !== null);
    if (roundHoles.length === 0) continue;
    const roundPar = roundHoles.reduce((sum, h) => sum + (h.par || 0), 0);
    const overPar = round.total_score - roundPar;

    if (bestScore === null || round.total_score < bestScore) {
      bestScore = round.total_score;
      bestOverPar = overPar;
    }
  }

  const puttingRoundValues = Object.values(puttsByRound);
  const bestPuttingRound = puttingRoundValues.length > 0 ? Math.min(...puttingRoundValues) : null;

  const firPercents = Object.values(firByRound)
    .filter(r => r.total >= 9)
    .map(r => (r.hit / r.total) * 100);
  const bestFirPercentInRound = firPercents.length > 0 ? Math.max(...firPercents) : null;

  const girPercents = Object.values(girByRound)
    .filter(r => r.total >= 9)
    .map(r => (r.hit / r.total) * 100);
  const bestGirPercentInRound = girPercents.length > 0 ? Math.max(...girPercents) : null;

  return {
    totalRounds: allRounds.length,
    bestScore,
    bestOverPar,
    totalBirdies,
    totalEagles,
    totalAlbatrosses,
    totalHolesInOne,
    totalPars,
    totalBogeys,
    totalDoubleBogeys,
    totalFairwaysHit,
    totalFairwaysAttempted,
    totalGreensHit,
    totalGreensAttempted,
    totalPutts,
    totalHolesPlayed: allHoleStats.filter(h => h.score !== null).length,
    totalDistanceKm: 0, // yardage column not yet available
    bestPuttingRound,
    totalScrambleSaves,
    totalScrambleAttempts,
    bestFirPercentInRound,
    bestGirPercentInRound,
  };
};

export const useAchievements = (timeRange: TimeRange) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["achievements", user?.id, timeRange],
    queryFn: async (): Promise<AchievementsData> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const dateCutoff = getDateCutoff(timeRange);

      let roundsQuery = supabase
        .from("rounds")
        .select("id, total_score, played_at")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false });

      if (dateCutoff) {
        roundsQuery = roundsQuery.gte("played_at", dateCutoff.toISOString());
      }

      const { data: rounds, error: roundsError } = await roundsQuery;
      if (roundsError) throw roundsError;

      const { data: allRounds, error: allRoundsError } = await supabase
        .from("rounds")
        .select("id, total_score, played_at")
        .eq("user_id", user.id);
      if (allRoundsError) throw allRoundsError;

      const allRoundIds = (allRounds || []).map(r => r.id);
      let allHoleStats: {
        round_id: string;
        score: number | null;
        par: number | null;
        fir: boolean | null;
        gir: boolean | null;
        putts: number | null;
        scramble: string | null;
      }[] = [];

      if (allRoundIds.length > 0) {
        for (let i = 0; i < allRoundIds.length; i += 100) {
          const chunk = allRoundIds.slice(i, i + 100);
          const { data, error } = await supabase
            .from("hole_stats")
            .select("round_id, score, par, fir, gir, putts, scramble")
            .in("round_id", chunk);
          if (error) throw error;
          if (data) allHoleStats = allHoleStats.concat(data);
        }
      }

      const userStats = buildUserStats(allRounds || [], allHoleStats);

      const challenges: Challenge[] = CHALLENGE_DEFINITIONS.map(def => {
        const result = def.evaluate(userStats);
        return {
          id: def.id,
          title: def.title,
          description: def.description,
          target: result.target,
          isCompleted: result.isCompleted,
          progress: result.progress,
          group: def.group,
        };
      });

      const filteredRoundIds = (rounds || []).map(r => r.id);
      const filteredHoleStats = allHoleStats.filter(h => filteredRoundIds.includes(h.round_id));

      const stats: AchievementStats = {
        holesInOne: 0,
        albatrosses: 0,
        eagles: 0,
        birdies: 0,
        pars: 0,
        bogeys: 0,
        doubleBogeys: 0,
      };

      filteredHoleStats.forEach((hole) => {
        if (hole.score === null || hole.par === null) return;
        const diff = hole.score - hole.par;
        if (hole.score === 1) stats.holesInOne++;
        if (diff <= -3) stats.albatrosses++;
        else if (diff === -2) stats.eagles++;
        else if (diff === -1) stats.birdies++;
        else if (diff === 0) stats.pars++;
        else if (diff === 1) stats.bogeys++;
        else if (diff >= 2) stats.doubleBogeys++;
      });

      return {
        stats,
        challenges,
        bestScore: userStats.bestScore,
        bestOverPar: userStats.bestOverPar,
        totalRounds: userStats.totalRounds,
      };
    },
    enabled: !!user?.id,
  });
};