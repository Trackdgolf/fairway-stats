import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type TimeRange = "3M" | "6M" | "1Y" | "MAX";

interface ChartDataPoint {
  date: string;
  value: number;
}

interface RoundStats {
  totalRounds: number;
  bestScore: number | null;
  avgScore: number | null;
  avgOverPar: number | null;
  avgPutts: number | null;
  firPercent: number | null;
  girPercent: number | null;
  scramblePercent: number | null;
  courses: string[];
}

interface TimeSeriesData {
  avgScore: ChartDataPoint[];
  avgOverPar: ChartDataPoint[];
  avgPutts: ChartDataPoint[];
  firPercent: ChartDataPoint[];
  girPercent: ChartDataPoint[];
  scramblePercent: ChartDataPoint[];
}

export const useRoundStats = (timeRange: TimeRange, courseFilter: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["roundStats", user?.id, timeRange, courseFilter],
    queryFn: async (): Promise<{ stats: RoundStats; timeSeries: TimeSeriesData }> => {
      if (!user?.id) {
        return {
          stats: {
            totalRounds: 0,
            bestScore: null,
            avgScore: null,
            avgOverPar: null,
            avgPutts: null,
            firPercent: null,
            girPercent: null,
            scramblePercent: null,
            courses: [],
          },
          timeSeries: {
            avgScore: [],
            avgOverPar: [],
            avgPutts: [],
            firPercent: [],
            girPercent: [],
            scramblePercent: [],
          },
        };
      }

      // Calculate date cutoff based on time range
      let dateCutoff: Date | null = null;
      if (timeRange === "3M") {
        const now = new Date();
        dateCutoff = new Date(now.setMonth(now.getMonth() - 3));
      } else if (timeRange === "6M") {
        const now = new Date();
        dateCutoff = new Date(now.setMonth(now.getMonth() - 6));
      } else if (timeRange === "1Y") {
        const now = new Date();
        dateCutoff = new Date(now.setFullYear(now.getFullYear() - 1));
      }

      // Fetch rounds
      let roundsQuery = supabase
        .from("rounds")
        .select("*")
        .order("played_at", { ascending: true });

      if (dateCutoff) {
        roundsQuery = roundsQuery.gte("played_at", dateCutoff.toISOString());
      }

      if (courseFilter !== "all") {
        roundsQuery = roundsQuery.eq("course_name", courseFilter);
      }

      const { data: rounds, error: roundsError } = await roundsQuery;
      if (roundsError) throw roundsError;

      if (!rounds || rounds.length === 0) {
        // Fetch all courses for the dropdown even if filtered results are empty
        const { data: allRounds } = await supabase.from("rounds").select("course_name");
        const courses = [...new Set(allRounds?.map((r) => r.course_name) || [])];

        return {
          stats: {
            totalRounds: 0,
            bestScore: null,
            avgScore: null,
            avgOverPar: null,
            avgPutts: null,
            firPercent: null,
            girPercent: null,
            scramblePercent: null,
            courses,
          },
          timeSeries: {
            avgScore: [],
            avgOverPar: [],
            avgPutts: [],
            firPercent: [],
            girPercent: [],
            scramblePercent: [],
          },
        };
      }

      const roundIds = rounds.map((r) => r.id);

      // Fetch hole stats for these rounds
      const { data: holeStats, error: holeStatsError } = await supabase
        .from("hole_stats")
        .select("*")
        .in("round_id", roundIds);

      if (holeStatsError) throw holeStatsError;

      // Calculate aggregate stats
      const totalRounds = rounds.length;
      const scores = rounds.map((r) => r.total_score).filter((s): s is number => s !== null);
      const bestScore = scores.length > 0 ? Math.min(...scores) : null;
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;

      // Calculate avg over par
      let totalOverPar = 0;
      let holesWithPar = 0;
      holeStats?.forEach((hole) => {
        if (hole.score !== null && hole.par !== null) {
          totalOverPar += hole.score - hole.par;
          holesWithPar++;
        }
      });
      const avgOverPar = holesWithPar > 0 ? totalOverPar / (holesWithPar / 18) : null;

      // Calculate avg putts per hole
      const putts = holeStats?.filter((h) => h.putts !== null).map((h) => h.putts as number) || [];
      const avgPutts = putts.length > 0 ? putts.reduce((a, b) => a + b, 0) / putts.length : null;

      // Calculate FIR % (exclude par 3s - where fir is null)
      const firHoles = holeStats?.filter((h) => h.fir !== null) || [];
      const firHits = firHoles.filter((h) => h.fir === true).length;
      const firPercent = firHoles.length > 0 ? (firHits / firHoles.length) * 100 : null;

      // Calculate GIR %
      const girHoles = holeStats?.filter((h) => h.gir !== null) || [];
      const girHits = girHoles.filter((h) => h.gir === true).length;
      const girPercent = girHoles.length > 0 ? (girHits / girHoles.length) * 100 : null;

      // Calculate Scramble %
      const scrambleAttempts = holeStats?.filter((h) => h.scramble === "yes" || h.scramble === "no") || [];
      const scrambleSuccesses = scrambleAttempts.filter((h) => h.scramble === "yes").length;
      const scramblePercent = scrambleAttempts.length > 0 ? (scrambleSuccesses / scrambleAttempts.length) * 100 : null;

      // Get unique courses
      const { data: allRounds } = await supabase.from("rounds").select("course_name");
      const courses = [...new Set(allRounds?.map((r) => r.course_name) || [])];

      // Calculate time series data grouped by month
      const roundsByMonth = new Map<string, typeof rounds>();
      rounds.forEach((round) => {
        const date = new Date(round.played_at || round.created_at || new Date());
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        if (!roundsByMonth.has(monthKey)) {
          roundsByMonth.set(monthKey, []);
        }
        roundsByMonth.get(monthKey)!.push(round);
      });

      const holeStatsByRound = new Map<string, typeof holeStats>();
      holeStats?.forEach((hole) => {
        if (!holeStatsByRound.has(hole.round_id)) {
          holeStatsByRound.set(hole.round_id, []);
        }
        holeStatsByRound.get(hole.round_id)!.push(hole);
      });

      const timeSeries: TimeSeriesData = {
        avgScore: [],
        avgOverPar: [],
        avgPutts: [],
        firPercent: [],
        girPercent: [],
        scramblePercent: [],
      };

      roundsByMonth.forEach((monthRounds, monthKey) => {
        const monthScores = monthRounds.map((r) => r.total_score).filter((s): s is number => s !== null);
        if (monthScores.length > 0) {
          timeSeries.avgScore.push({
            date: monthKey,
            value: parseFloat((monthScores.reduce((a, b) => a + b, 0) / monthScores.length).toFixed(1)),
          });
        }

        // Get hole stats for this month's rounds
        const monthHoleStats: typeof holeStats = [];
        monthRounds.forEach((r) => {
          const holes = holeStatsByRound.get(r.id);
          if (holes) monthHoleStats.push(...holes);
        });

        // Avg over par for month
        let monthOverPar = 0;
        let monthHolesWithPar = 0;
        monthHoleStats.forEach((hole) => {
          if (hole.score !== null && hole.par !== null) {
            monthOverPar += hole.score - hole.par;
            monthHolesWithPar++;
          }
        });
        if (monthHolesWithPar > 0) {
          timeSeries.avgOverPar.push({
            date: monthKey,
            value: parseFloat((monthOverPar / (monthHolesWithPar / 18)).toFixed(1)),
          });
        }

        // Avg putts for month
        const monthPutts = monthHoleStats.filter((h) => h.putts !== null).map((h) => h.putts as number);
        if (monthPutts.length > 0) {
          timeSeries.avgPutts.push({
            date: monthKey,
            value: parseFloat((monthPutts.reduce((a, b) => a + b, 0) / monthPutts.length).toFixed(1)),
          });
        }

        // FIR % for month
        const monthFirHoles = monthHoleStats.filter((h) => h.fir !== null);
        const monthFirHits = monthFirHoles.filter((h) => h.fir === true).length;
        if (monthFirHoles.length > 0) {
          timeSeries.firPercent.push({
            date: monthKey,
            value: Math.round((monthFirHits / monthFirHoles.length) * 100),
          });
        }

        // GIR % for month
        const monthGirHoles = monthHoleStats.filter((h) => h.gir !== null);
        const monthGirHits = monthGirHoles.filter((h) => h.gir === true).length;
        if (monthGirHoles.length > 0) {
          timeSeries.girPercent.push({
            date: monthKey,
            value: Math.round((monthGirHits / monthGirHoles.length) * 100),
          });
        }

        // Scramble % for month
        const monthScrambleAttempts = monthHoleStats.filter((h) => h.scramble === "yes" || h.scramble === "no");
        const monthScrambleSuccesses = monthScrambleAttempts.filter((h) => h.scramble === "yes").length;
        if (monthScrambleAttempts.length > 0) {
          timeSeries.scramblePercent.push({
            date: monthKey,
            value: Math.round((monthScrambleSuccesses / monthScrambleAttempts.length) * 100),
          });
        }
      });

      return {
        stats: {
          totalRounds,
          bestScore,
          avgScore: avgScore ? parseFloat(avgScore.toFixed(1)) : null,
          avgOverPar: avgOverPar ? parseFloat(avgOverPar.toFixed(1)) : null,
          avgPutts: avgPutts ? parseFloat(avgPutts.toFixed(1)) : null,
          firPercent: firPercent !== null ? Math.round(firPercent) : null,
          girPercent: girPercent !== null ? Math.round(girPercent) : null,
          scramblePercent: scramblePercent !== null ? Math.round(scramblePercent) : null,
          courses,
        },
        timeSeries,
      };
    },
    enabled: !!user?.id,
  });
};
