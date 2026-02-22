import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export interface HolePerformance {
  holeNumber: number;
  par: number;
  avgScore: number;
  avgOverPar: number;
  personalStrokeIndex: number;
  roundsPlayed: number;
}

export interface CoursePerformance {
  courseId: string;
  courseName: string;
  roundCount: number;
  holes: HolePerformance[];
}

export const useCoursePerformance = () => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["course-performance", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<CoursePerformance[]> => {
      // Fetch all rounds for the user
      const { data: rounds, error: roundsError } = await supabase
        .from("rounds")
        .select("id, course_id, course_name")
        .eq("user_id", user!.id);

      if (roundsError) throw roundsError;
      if (!rounds?.length) return [];

      // Group by course_id
      const courseMap = new Map<string, { courseName: string; roundIds: string[] }>();
      for (const r of rounds) {
        const key = r.course_id || r.course_name;
        const existing = courseMap.get(key);
        if (existing) {
          existing.roundIds.push(r.id);
        } else {
          courseMap.set(key, { courseName: r.course_name, roundIds: [r.id] });
        }
      }

      // Include all courses with at least 1 round
      const qualifyingCourses = Array.from(courseMap.entries()).filter(
        ([, v]) => v.roundIds.length >= 1
      );

      if (!qualifyingCourses.length) return [];

      // Fetch hole_stats for all qualifying round IDs
      const allRoundIds = qualifyingCourses.flatMap(([, v]) => v.roundIds);
      const { data: holeStats, error: hsError } = await supabase
        .from("hole_stats")
        .select("round_id, hole_number, par, score")
        .in("round_id", allRoundIds);

      if (hsError) throw hsError;

      // Build a lookup: roundId -> courseKey
      const roundToCourse = new Map<string, string>();
      for (const [key, v] of qualifyingCourses) {
        for (const rid of v.roundIds) {
          roundToCourse.set(rid, key);
        }
      }

      // Group hole stats by course then hole number
      const courseHoleMap = new Map<string, Map<number, { pars: number[]; scores: number[] }>>();
      for (const hs of holeStats || []) {
        if (hs.score == null || hs.par == null) continue;
        const courseKey = roundToCourse.get(hs.round_id);
        if (!courseKey) continue;

        if (!courseHoleMap.has(courseKey)) courseHoleMap.set(courseKey, new Map());
        const holes = courseHoleMap.get(courseKey)!;
        if (!holes.has(hs.hole_number)) holes.set(hs.hole_number, { pars: [], scores: [] });
        const h = holes.get(hs.hole_number)!;
        h.pars.push(hs.par);
        h.scores.push(hs.score);
      }

      // Build results
      const results: CoursePerformance[] = qualifyingCourses.map(([key, v]) => {
        const holesMap = courseHoleMap.get(key) || new Map();
        const holesArr: HolePerformance[] = Array.from(holesMap.entries()).map(
          ([holeNumber, data]) => {
            const avgScore = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
            const avgPar = data.pars.reduce((a, b) => a + b, 0) / data.pars.length;
            return {
              holeNumber,
              par: Math.round(avgPar),
              avgScore: Math.round(avgScore * 10) / 10,
              avgOverPar: Math.round((avgScore - avgPar) * 10) / 10,
              personalStrokeIndex: 0, // assigned below
              roundsPlayed: data.scores.length,
            };
          }
        );

        // Assign personal stroke index: SI 1 = hardest (highest avgOverPar)
        const sorted = [...holesArr].sort((a, b) => b.avgOverPar - a.avgOverPar);
        sorted.forEach((h, i) => {
          h.personalStrokeIndex = i + 1;
        });

        return {
          courseId: key,
          courseName: v.courseName,
          roundCount: v.roundIds.length,
          holes: holesArr.sort((a, b) => a.holeNumber - b.holeNumber),
        };
      });

      return results.sort((a, b) => b.roundCount - a.roundCount);
    },
  });
};
