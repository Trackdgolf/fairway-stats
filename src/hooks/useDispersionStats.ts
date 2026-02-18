import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { TimeRange } from "@/hooks/useRoundStats";

export interface ScrambleClubStats {
  club: string;
  attempts: number;
  successes: number;
  successRate: number;
}

export interface DispersionStats {
  teeShots: {
    total: number;
    fwHit: number;
    left: number;
    right: number;
    short: number;
  };
  approach: {
    total: number;
    onGreen: number;
    long: number;
    left: number;
    right: number;
    short: number;
  };
  scramble: {
    total: number;
    clubs: ScrambleClubStats[];
  };
  teeClubs: string[];
  approachClubs: string[];
}

const getDateCutoff = (timeRange: TimeRange): Date | null => {
  if (timeRange === "MAX" || timeRange === "LAST") return null;
  const now = new Date();
  switch (timeRange) {
    case "3M":
      return new Date(now.setMonth(now.getMonth() - 3));
    case "6M":
      return new Date(now.setMonth(now.getMonth() - 6));
    case "1Y":
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return null;
  }
};

export const useDispersionStats = (
  selectedTeeClub: string,
  selectedApproachClub: string,
  selectedScrambleShotType: string = "all",
  timeRange: TimeRange = "MAX"
) => {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["dispersion-stats", selectedTeeClub, selectedApproachClub, selectedScrambleShotType, timeRange],
    queryFn: async (): Promise<DispersionStats> => {
      // Step 1: Get qualifying round IDs based on time range
      let roundsQuery = supabase
        .from("rounds")
        .select("id, played_at")
        .order("played_at", { ascending: false });

      const dateCutoff = getDateCutoff(timeRange);
      if (dateCutoff) {
        roundsQuery = roundsQuery.gte("played_at", dateCutoff.toISOString());
      }

      const { data: rounds, error: roundsError } = await roundsQuery;
      if (roundsError) throw roundsError;

      let qualifyingRoundIds: string[];

      if (timeRange === "LAST") {
        // Only use the most recent round
        qualifyingRoundIds = rounds && rounds.length > 0 ? [rounds[0].id] : [];
      } else {
        qualifyingRoundIds = (rounds || []).map((r) => r.id);
      }

      // If no qualifying rounds, return empty stats
      if (qualifyingRoundIds.length === 0) {
        return {
          teeShots: { total: 0, fwHit: 0, left: 0, right: 0, short: 0 },
          approach: { total: 0, onGreen: 0, long: 0, left: 0, right: 0, short: 0 },
          scramble: { total: 0, clubs: [] },
          teeClubs: [],
          approachClubs: [],
        };
      }

      // Step 2: Fetch hole stats filtered by qualifying round IDs
      const { data: holeStats, error } = await supabase
        .from("hole_stats")
        .select("*")
        .in("round_id", qualifyingRoundIds);

      if (error) throw error;

      const stats = holeStats || [];

      // Extract unique clubs
      const teeClubs = [...new Set(stats.map(s => s.tee_club).filter(Boolean))] as string[];
      const approachClubs = [...new Set(stats.map(s => s.approach_club).filter(Boolean))] as string[];

      // Filter tee shots by selected club
      const teeShots = selectedTeeClub === "all"
        ? stats.filter(s => s.fir_direction)
        : stats.filter(s => s.tee_club === selectedTeeClub && s.fir_direction);

      const teeShotTotal = teeShots.length;
      const teeDispersion = {
        total: teeShotTotal,
        fwHit: teeShotTotal > 0 ? Math.round((teeShots.filter(s => s.fir_direction === 'hit').length / teeShotTotal) * 100) : 0,
        left: teeShotTotal > 0 ? Math.round((teeShots.filter(s => s.fir_direction === 'left').length / teeShotTotal) * 100) : 0,
        right: teeShotTotal > 0 ? Math.round((teeShots.filter(s => s.fir_direction === 'right').length / teeShotTotal) * 100) : 0,
        short: teeShotTotal > 0 ? Math.round((teeShots.filter(s => s.fir_direction === 'short').length / teeShotTotal) * 100) : 0,
      };

      // Filter approach shots by selected club
      const approachShots = selectedApproachClub === "all"
        ? stats.filter(s => s.gir_direction)
        : stats.filter(s => s.approach_club === selectedApproachClub && s.gir_direction);

      const approachTotal = approachShots.length;
      const approachDispersion = {
        total: approachTotal,
        onGreen: approachTotal > 0 ? Math.round((approachShots.filter(s => s.gir_direction === 'hit').length / approachTotal) * 100) : 0,
        long: approachTotal > 0 ? Math.round((approachShots.filter(s => s.gir_direction === 'long').length / approachTotal) * 100) : 0,
        left: approachTotal > 0 ? Math.round((approachShots.filter(s => s.gir_direction === 'left').length / approachTotal) * 100) : 0,
        right: approachTotal > 0 ? Math.round((approachShots.filter(s => s.gir_direction === 'right').length / approachTotal) * 100) : 0,
        short: approachTotal > 0 ? Math.round((approachShots.filter(s => s.gir_direction === 'short').length / approachTotal) * 100) : 0,
      };

      // Calculate scramble statistics
      const scrambleAttempts = stats.filter(s => {
        const isScrambleAttempt = s.scramble === 'yes' || s.scramble === 'no';
        if (!isScrambleAttempt) return false;
        if (selectedScrambleShotType === "all") return true;
        return s.scramble_shot_type === selectedScrambleShotType;
      });

      const clubStatsMap: Record<string, { attempts: number; successes: number }> = {};

      scrambleAttempts.forEach(stat => {
        const club = stat.scramble_club;
        if (!club) return;

        if (!clubStatsMap[club]) {
          clubStatsMap[club] = { attempts: 0, successes: 0 };
        }
        clubStatsMap[club].attempts++;
        if (stat.scramble === 'yes') {
          clubStatsMap[club].successes++;
        }
      });

      const rankedClubs: ScrambleClubStats[] = Object.entries(clubStatsMap)
        .map(([club, data]) => ({
          club,
          attempts: data.attempts,
          successes: data.successes,
          successRate: data.attempts > 0 ? Math.round((data.successes / data.attempts) * 100) : 0
        }))
        .sort((a, b) => b.successRate - a.successRate);

      return {
        teeShots: teeDispersion,
        approach: approachDispersion,
        scramble: {
          total: scrambleAttempts.length,
          clubs: rankedClubs,
        },
        teeClubs,
        approachClubs,
      };
    },
  });
};
