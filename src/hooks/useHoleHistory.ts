import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface HolePlay {
  playedAt: string;
  score: number;
  par: number;
  teeClub: string | null;
  fir: boolean | null;
  firDirection: string | null;
  yardage: number | null;
  gir: boolean | null;
  girDirection: string | null;
  scramble: string | null;
}

export const useHoleHistory = (courseId: string | null, holeNumber: number | null) => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["hole-history", user?.id, courseId, holeNumber],
    enabled: !!user && !!courseId && holeNumber != null,
    queryFn: async (): Promise<HolePlay[]> => {
      // Get round IDs for this course
      const { data: rounds, error: roundsError } = await supabase
        .from("rounds")
        .select("id, played_at, course_id, course_name")
        .eq("user_id", user!.id)
        .order("played_at", { ascending: false });

      if (roundsError) throw roundsError;
      if (!rounds?.length) return [];

      // Filter rounds matching this course
      const courseRounds = rounds.filter(r => (r.course_id || r.course_name) === courseId);
      if (!courseRounds.length) return [];

      const recentRounds = courseRounds;
      const roundIds = recentRounds.map(r => r.id);

      const { data: holeStats, error: hsError } = await supabase
        .from("hole_stats")
        .select("round_id, score, par, tee_club, fir, fir_direction, approach_club, gir, gir_direction, yardage")
        .in("round_id", roundIds)
        .eq("hole_number", holeNumber!);

      if (hsError) throw hsError;

      // Map round_id to played_at
      const roundDateMap = new Map(recentRounds.map(r => [r.id, r.played_at]));

      return (holeStats || [])
        .filter(hs => hs.score != null && hs.par != null)
        .map(hs => {
          const isPar3 = hs.par === 3;
          return {
            playedAt: roundDateMap.get(hs.round_id) || "",
            score: hs.score!,
            par: hs.par!,
            teeClub: isPar3 ? hs.approach_club : hs.tee_club,
            fir: isPar3 ? hs.gir : hs.fir,
            firDirection: isPar3 ? hs.gir_direction : hs.fir_direction,
            yardage: hs.yardage ?? null,
            gir: hs.gir ?? null,
            girDirection: hs.gir_direction ?? null,
            scramble: hs.scramble ?? null,
          };
        })
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
    },
  });
};
