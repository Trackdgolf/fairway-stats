import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { TimeRange } from "@/hooks/useRoundStats";

export interface ClubScoringEntry {
  club: string;
  avgOverPar: number;
  totalHoles: number;
}

export interface ClubScoringStats {
  tee: ClubScoringEntry[];
  approach: ClubScoringEntry[];
  scramble: ClubScoringEntry[];
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

export const useClubScoringStats = (timeRange: TimeRange = "MAX") => {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["club-scoring-stats", timeRange],
    queryFn: async (): Promise<ClubScoringStats> => {
      // Get qualifying round IDs
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
        qualifyingRoundIds = rounds && rounds.length > 0 ? [rounds[0].id] : [];
      } else {
        qualifyingRoundIds = (rounds || []).map((r) => r.id);
      }

      if (qualifyingRoundIds.length === 0) {
        return { tee: [], approach: [], scramble: [] };
      }

      // Fetch hole stats with score and par
      const { data: holes, error } = await supabase
        .from("hole_stats")
        .select("tee_club, approach_club, scramble_club, score, par")
        .in("round_id", qualifyingRoundIds)
        .not("score", "is", null)
        .not("par", "is", null);

      if (error) throw error;
      if (!holes || holes.length === 0) {
        return { tee: [], approach: [], scramble: [] };
      }

      // Group and calculate averages
      const teeMap = new Map<string, { total: number; diff: number }>();
      const approachMap = new Map<string, { total: number; diff: number }>();
      const scrambleMap = new Map<string, { total: number; diff: number }>();

      for (const hole of holes) {
        const diff = (hole.score as number) - (hole.par as number);

        if (hole.tee_club) {
          const entry = teeMap.get(hole.tee_club) || { total: 0, diff: 0 };
          entry.total++;
          entry.diff += diff;
          teeMap.set(hole.tee_club, entry);
        }

        if (hole.approach_club) {
          const entry = approachMap.get(hole.approach_club) || { total: 0, diff: 0 };
          entry.total++;
          entry.diff += diff;
          approachMap.set(hole.approach_club, entry);
        }

        if (hole.scramble_club) {
          const entry = scrambleMap.get(hole.scramble_club) || { total: 0, diff: 0 };
          entry.total++;
          entry.diff += diff;
          scrambleMap.set(hole.scramble_club, entry);
        }
      }

      const mapToEntries = (map: Map<string, { total: number; diff: number }>): ClubScoringEntry[] =>
        Array.from(map.entries()).map(([club, data]) => ({
          club,
          avgOverPar: Number((data.diff / data.total).toFixed(2)),
          totalHoles: data.total,
        }));

      return {
        tee: mapToEntries(teeMap),
        approach: mapToEntries(approachMap),
        scramble: mapToEntries(scrambleMap),
      };
    },
  });
};
