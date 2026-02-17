import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { CHALLENGE_DEFINITIONS, UserStats, RoundHoleData, getContinent } from "@/lib/challengeDefinitions";

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
  sequence?: string;
  sequenceOrder?: number;
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

// ── Build all stats needed by the 74 challenges ─────────────────────────────
type HoleStatRow = RoundHoleData & { round_id: string; yardage?: number | null };

const buildUserStats = (
  allRounds: { id: string; total_score: number | null; course_id: string | null; country: string | null }[],
  allHoleStats: HoleStatRow[]
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
  let totalYards = 0;

  // Per-round aggregation buckets
  const puttsByRound: Record<string, number> = {};
  const firByRound: Record<string, { hit: number; total: number }> = {};
  const girByRound: Record<string, { hit: number; total: number }> = {};
  const holesByRound: Record<string, HoleStatRow[]> = {};

  // Boolean detections
  let hasBackToBackBirdies = false;
  let hasBounceBack = false;
  let hasEvenFront9 = false;
  let hasEvenBack9 = false;
  let hasUnderParPar5sInRound = false;
  let hasUnderParFront9 = false;
  let hasUnderParBack9 = false;
  let hasDoubleBogeyFreeRound = false;
  let hasUnderParPar3sInRound = false;
  let hasUnderParPar4sInRound = false;
  let hasScratchRound = false;
  let hasUnderParRound = false;
  let hasBogeyFreeRound = false;
  let hasDialledRound = false;
  let hasBirdieAllPar3sInRound = false;
  let hasEaglePar4 = false;
  let hasNo3PuttRound = false;
  let hasChipHoleOut = false;
  let hasPitchHoleOut = false;
  let hasBunkerHoleOut = false;
  let hasSandyLyle = false;
  let hasPitchPlease = false;
  let hasFishAndChips = false;
  let hasSnowman = false;
  let hasDoubleDigits = false;
  let has4PlusPutt = false;
  let has0FirRound = false;
  let has0GirRound = false;
  let hasBackToBackDoubles = false;
  let hasFalseStart = false;
  let hasSlowStart = false;
  let hasFinishingWhimper = false;
  let hasPenaltyPrincess = false;
  let hasMakingSandcastles = false;

  // ── First pass: aggregate totals and group holes by round ──
  for (const hole of allHoleStats) {
    // Group by round
    if (!holesByRound[hole.round_id]) holesByRound[hole.round_id] = [];
    holesByRound[hole.round_id].push(hole);

    if (hole.score !== null && hole.par !== null) {
      const diff = hole.score - hole.par;
      if (hole.score === 1) totalHolesInOne++;
      if (diff <= -3) totalAlbatrosses++;
      else if (diff === -2) { totalEagles++; if (hole.par === 4) hasEaglePar4 = true; }
      else if (diff === -1) totalBirdies++;
      else if (diff === 0) totalPars++;
      else if (diff === 1) totalBogeys++;
      else if (diff >= 2) totalDoubleBogeys++;

      if (hole.score === 8) hasSnowman = true;
      if (hole.score >= 10) hasDoubleDigits = true;
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
      if (hole.putts >= 4) has4PlusPutt = true;
    }

    if (hole.scramble !== null) {
      totalScrambleAttempts++;
      if (hole.scramble === "yes") totalScrambleSaves++;
    }

    // Short game hole-outs and up-n-downs
    if (hole.scramble_shot_type && hole.putts !== null) {
      if (hole.putts === 0) {
        if (hole.scramble_shot_type === "chip") hasChipHoleOut = true;
        if (hole.scramble_shot_type === "pitch") hasPitchHoleOut = true;
        if (hole.scramble_shot_type === "bunker") hasBunkerHoleOut = true;
      }
      if (hole.putts === 1) {
        if (hole.scramble_shot_type === "bunker") hasSandyLyle = true;
        if (hole.scramble_shot_type === "pitch") hasPitchPlease = true;
        if (hole.scramble_shot_type === "chip") hasFishAndChips = true;
      }
    }

    // Yardage for distance
    if (hole.yardage) totalYards += hole.yardage;
  }

  // ── Second pass: per-round sequential analysis ──
  for (const round of allRounds) {
    if (round.total_score === null) continue;
    const roundHoles = (holesByRound[round.id] || [])
      .filter(h => h.score !== null && h.par !== null)
      .sort((a, b) => a.hole_number - b.hole_number);
    if (roundHoles.length === 0) continue;

    const roundPar = roundHoles.reduce((sum, h) => sum + (h.par || 0), 0);
    const overPar = round.total_score - roundPar;

    if (bestScore === null || round.total_score < bestScore) {
      bestScore = round.total_score;
      bestOverPar = overPar;
    }

    // Scratch / Under par
    if (overPar === 0) hasScratchRound = true;
    if (overPar < 0) hasUnderParRound = true;

    // Double bogey free / bogey free
    const maxDiff = Math.max(...roundHoles.map(h => (h.score || 0) - (h.par || 0)));
    if (roundHoles.length >= 18 && maxDiff <= 1) hasDoubleBogeyFreeRound = true;
    if (roundHoles.length >= 18 && maxDiff <= 0) hasBogeyFreeRound = true;

    // No 3-putt round
    if (roundHoles.length >= 18 && roundHoles.every(h => h.putts === null || h.putts <= 2)) {
      hasNo3PuttRound = true;
    }

    // Front 9 / Back 9 analysis
    const front9 = roundHoles.filter(h => h.hole_number <= 9);
    const back9 = roundHoles.filter(h => h.hole_number > 9);
    if (front9.length >= 9) {
      const f9Score = front9.reduce((s, h) => s + (h.score || 0), 0);
      const f9Par = front9.reduce((s, h) => s + (h.par || 0), 0);
      if (f9Score === f9Par) hasEvenFront9 = true;
      if (f9Score < f9Par) hasUnderParFront9 = true;
    }
    if (back9.length >= 9) {
      const b9Score = back9.reduce((s, h) => s + (h.score || 0), 0);
      const b9Par = back9.reduce((s, h) => s + (h.par || 0), 0);
      if (b9Score === b9Par) hasEvenBack9 = true;
      if (b9Score < b9Par) hasUnderParBack9 = true;
    }

    // Par-specific: par 3s, 4s, 5s under par in a round
    const par3s = roundHoles.filter(h => h.par === 3);
    const par4s = roundHoles.filter(h => h.par === 4);
    const par5s = roundHoles.filter(h => h.par === 5);
    if (par3s.length > 0) {
      const p3Score = par3s.reduce((s, h) => s + (h.score || 0), 0);
      const p3Par = par3s.reduce((s, h) => s + (h.par || 0), 0);
      if (p3Score < p3Par) hasUnderParPar3sInRound = true;
      if (par3s.every(h => (h.score || 0) === (h.par || 0) - 1)) hasBirdieAllPar3sInRound = true;
    }
    if (par4s.length > 0) {
      const p4Score = par4s.reduce((s, h) => s + (h.score || 0), 0);
      const p4Par = par4s.reduce((s, h) => s + (h.par || 0), 0);
      if (p4Score < p4Par) hasUnderParPar4sInRound = true;
    }
    if (par5s.length > 0) {
      const p5Score = par5s.reduce((s, h) => s + (h.score || 0), 0);
      const p5Par = par5s.reduce((s, h) => s + (h.par || 0), 0);
      if (p5Score < p5Par) hasUnderParPar5sInRound = true;
    }

    // Dialled: 100% FIR + GIR in a round
    const roundFir = firByRound[round.id];
    const roundGir = girByRound[round.id];
    if (roundFir && roundGir && roundFir.hit === roundFir.total && roundGir.hit === roundGir.total
        && roundFir.total >= 9 && roundGir.total >= 9) {
      hasDialledRound = true;
    }

    // 0% FIR / 0% GIR rounds
    if (roundFir && roundFir.total >= 9 && roundFir.hit === 0) has0FirRound = true;
    if (roundGir && roundGir.total >= 9 && roundGir.hit === 0) has0GirRound = true;

    // Sequential hole analysis
    for (let i = 1; i < roundHoles.length; i++) {
      const prev = roundHoles[i - 1];
      const curr = roundHoles[i];
      const prevDiff = (prev.score || 0) - (prev.par || 0);
      const currDiff = (curr.score || 0) - (curr.par || 0);

      if (prevDiff === -1 && currDiff === -1) hasBackToBackBirdies = true;
      if (prevDiff >= 1 && currDiff === -1) hasBounceBack = true;
      if (prevDiff >= 2 && currDiff >= 2) hasBackToBackDoubles = true;
      if (prevDiff === -1 && currDiff >= 2) hasFalseStart = true;
    }

    // First / last hole
    const firstHole = roundHoles.find(h => h.hole_number === 1);
    const lastHole = roundHoles.find(h => h.hole_number === 18);
    if (firstHole && firstHole.score !== null && firstHole.par !== null) {
      if ((firstHole.score - firstHole.par) >= 2) hasSlowStart = true;
    }
    if (lastHole && lastHole.score !== null && lastHole.par !== null) {
      if ((lastHole.score - lastHole.par) >= 2) hasFinishingWhimper = true;
    }

    // Penalty Princess: 5+ penalties in a round
    const roundPenalties = roundHoles.reduce((s, h) => s + (h.penalties || 0), 0);
    if (roundPenalties >= 5) hasPenaltyPrincess = true;

    // Making Sandcastles: 5+ bunker shots in a round
    const bunkerCount = roundHoles.filter(h => h.scramble_shot_type === "bunker").length;
    if (bunkerCount >= 5) hasMakingSandcastles = true;
  }

  // Distinct courses & countries/continents
  const courseIds = new Set(allRounds.filter(r => r.course_id).map(r => r.course_id!));
  const countries = [...new Set(allRounds.filter(r => r.country).map(r => r.country!))];
  const continents = [...new Set(countries.map(c => getContinent(c)).filter(Boolean) as string[])];

  // Best per-round percentages
  const puttingRoundValues = Object.values(puttsByRound);
  const bestPuttingRound = puttingRoundValues.length > 0 ? Math.min(...puttingRoundValues) : null;
  const firPercents = Object.values(firByRound).filter(r => r.total >= 9).map(r => (r.hit / r.total) * 100);
  const bestFirPercentInRound = firPercents.length > 0 ? Math.max(...firPercents) : null;
  const girPercents = Object.values(girByRound).filter(r => r.total >= 9).map(r => (r.hit / r.total) * 100);
  const bestGirPercentInRound = girPercents.length > 0 ? Math.max(...girPercents) : null;

  const totalMiles = totalYards / 1760;

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
    totalDistanceMiles: Math.round(totalMiles * 100) / 100,
    bestPuttingRound,
    totalScrambleSaves,
    totalScrambleAttempts,
    bestFirPercentInRound,
    bestGirPercentInRound,
    distinctCourseCount: courseIds.size,
    distinctCountries: countries,
    distinctContinents: continents,
    hasBackToBackBirdies,
    hasBounceBack,
    hasEvenFront9,
    hasEvenBack9,
    hasUnderParPar5sInRound,
    hasUnderParFront9,
    hasUnderParBack9,
    hasDoubleBogeyFreeRound,
    hasUnderParPar3sInRound,
    hasUnderParPar4sInRound,
    hasScratchRound,
    hasUnderParRound,
    hasBogeyFreeRound,
    hasDialledRound,
    hasBirdieAllPar3sInRound,
    hasEaglePar4,
    hasNo3PuttRound,
    hasChipHoleOut,
    hasPitchHoleOut,
    hasBunkerHoleOut,
    hasSandyLyle,
    hasPitchPlease,
    hasFishAndChips,
    hasSnowman,
    hasDoubleDigits,
    has4PlusPutt,
    has0FirRound,
    has0GirRound,
    hasBackToBackDoubles,
    hasFalseStart,
    hasSlowStart,
    hasFinishingWhimper,
    hasPenaltyPrincess,
    hasMakingSandcastles,
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

      // Fetch ALL rounds (for challenge evaluation - challenges are lifetime)
      const { data: allRounds, error: allRoundsError } = await supabase
        .from("rounds")
        .select("id, total_score, played_at, course_id, country")
        .eq("user_id", user.id);
      if (allRoundsError) throw allRoundsError;

      const allRoundIds = (allRounds || []).map(r => r.id);
      let allHoleStats: HoleStatRow[] = [];

      if (allRoundIds.length > 0) {
        for (let i = 0; i < allRoundIds.length; i += 100) {
          const chunk = allRoundIds.slice(i, i + 100);
          const { data, error } = await supabase
            .from("hole_stats")
            .select("round_id, hole_number, score, par, fir, gir, putts, scramble, scramble_shot_type, penalties, yardage")
            .in("round_id", chunk);
          if (error) throw error;
          if (data) allHoleStats = allHoleStats.concat(data as HoleStatRow[]);
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
          sequence: def.sequence,
          sequenceOrder: def.sequenceOrder,
        };
      });

      // Time-filtered stats for the achievement counters
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
