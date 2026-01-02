import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

interface TrackdHandicapResult {
  handicap: number | null;
  roundsUsed: number;
  totalRounds: number;
  isLoading: boolean;
  error: Error | null;
}

export const useTrackdHandicap = (): TrackdHandicapResult => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['trackd-handicap', user?.id],
    queryFn: async () => {
      // Fetch the 20 most recent rounds
      const { data: rounds, error: roundsError } = await supabase
        .from('rounds')
        .select('id, total_score, played_at')
        .order('played_at', { ascending: false })
        .limit(20);

      if (roundsError) throw roundsError;
      if (!rounds || rounds.length === 0) {
        return { handicap: null, roundsUsed: 0, totalRounds: 0 };
      }

      // Fetch hole_stats for these rounds to calculate course par
      const roundIds = rounds.map(r => r.id);
      const { data: holeStats, error: holeStatsError } = await supabase
        .from('hole_stats')
        .select('round_id, par')
        .in('round_id', roundIds);

      if (holeStatsError) throw holeStatsError;

      // Calculate course par for each round
      const roundPars: Record<string, number> = {};
      holeStats?.forEach(hole => {
        if (hole.par !== null) {
          roundPars[hole.round_id] = (roundPars[hole.round_id] || 0) + hole.par;
        }
      });

      // Calculate differentials for rounds with valid data
      const differentials: number[] = [];
      rounds.forEach(round => {
        const coursePar = roundPars[round.id];
        if (round.total_score !== null && coursePar) {
          differentials.push(round.total_score - coursePar);
        }
      });

      if (differentials.length < 3) {
        return { handicap: null, roundsUsed: differentials.length, totalRounds: differentials.length };
      }

      // Sort differentials ascending (best = lowest)
      differentials.sort((a, b) => a - b);

      // Select best rounds based on count (graduated scale)
      const getSelectCount = (totalRounds: number): number => {
        if (totalRounds >= 20) return 8;
        if (totalRounds >= 13) return 6;
        if (totalRounds >= 7) return 5;
        return 3; // 3-6 rounds
      };

      const selectCount = getSelectCount(differentials.length);
      const bestDifferentials = differentials.slice(0, selectCount);

      // Calculate average
      const handicap = bestDifferentials.reduce((sum, d) => sum + d, 0) / selectCount;

      return {
        handicap: Math.round(handicap * 10) / 10,
        roundsUsed: selectCount,
        totalRounds: differentials.length,
      };
    },
    enabled: !!user?.id,
  });

  return {
    handicap: data?.handicap ?? null,
    roundsUsed: data?.roundsUsed ?? 0,
    totalRounds: data?.totalRounds ?? 0,
    isLoading,
    error: error as Error | null,
  };
};
