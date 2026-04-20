import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

interface StreakData {
  threePutt: { current: number; longest: number };
  doubleBogey: { current: number; longest: number };
  penalty: { current: number; longest: number };
  isLoading: boolean;
}

export const useStreakTrackers = (): StreakData => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const { data, isLoading } = useQuery({
    queryKey: ["streak-trackers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Fetch all rounds with hole stats, ordered most recent first
      const { data: rounds, error } = await supabase
        .from("rounds")
        .select("played_at, hole_stats(hole_number, score, par, putts, penalties)")
        .eq("user_id", user!.id)
        .order("played_at", { ascending: false });

      if (error) throw error;
      if (!rounds?.length) return {
        threePutt: { current: 0, longest: 0 },
        doubleBogey: { current: 0, longest: 0 },
        penalty: { current: 0, longest: 0 },
      };

      // Flatten holes: sort by round played_at DESC, then hole_number DESC
      const allHoles: Array<{ score: number | null; par: number | null; putts: number | null; penalties: number | null }> = [];
      for (const round of rounds) {
        const holes = (round.hole_stats as Array<{ hole_number: number; score: number | null; par: number | null; putts: number | null; penalties: number | null }>) || [];
        const sorted = [...holes].sort((a, b) => b.hole_number - a.hole_number);
        allHoles.push(...sorted);
      }

      const threePutt = calcStreak(allHoles, (h) => {
        if (h.putts == null) return null;
        return h.putts >= 3;
      });

      const doubleBogey = calcStreak(allHoles, (h) => {
        if (h.score == null || h.par == null) return null;
        return h.score >= h.par + 2;
      });

      const penalty = calcStreak(allHoles, (h) => {
        // Treat null/missing penalties as 0 (no penalty recorded)
        return (h.penalties ?? 0) > 0;
      });

      return { threePutt, doubleBogey, penalty };
    },
  });

  return {
    threePutt: data?.threePutt ?? { current: 0, longest: 0 },
    doubleBogey: data?.doubleBogey ?? { current: 0, longest: 0 },
    penalty: data?.penalty ?? { current: 0, longest: 0 },
    isLoading,
  };
};

function calcStreak(
  holes: Array<{ score: number | null; par: number | null; putts: number | null; penalties: number | null }>,
  isBadEvent: (h: { score: number | null; par: number | null; putts: number | null; penalties: number | null }) => boolean | null
): { current: number; longest: number } {
  let current = 0;
  let currentFound = false;
  let longest = 0;
  let run = 0;

  for (const h of holes) {
    const bad = isBadEvent(h);
    if (bad === null) continue; // skip holes with missing data

    if (bad) {
      if (!currentFound) {
        current = run;
        currentFound = true;
      }
      if (run > longest) longest = run;
      run = 0;
    } else {
      run++;
    }
  }

  // If we never found a bad event, current streak is the entire run
  if (!currentFound) current = run;
  if (run > longest) longest = run;

  return { current, longest };
}
