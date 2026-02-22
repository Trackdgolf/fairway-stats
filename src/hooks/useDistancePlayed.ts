import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { TimeRange } from "./useAchievements";

export interface DistanceData {
  totalYards: number;
  totalMiles: number;
  totalKm: number;
  holesPlayed: number;
  roundsPlayed: number;
}

export interface DistanceMilestone {
  label: string;
  emoji: string;
  distanceKm: number;
}

const MILESTONES: DistanceMilestone[] = [
  { label: "A park run!", emoji: "🏃", distanceKm: 5 },
  { label: "A 10K race!", emoji: "🏅", distanceKm: 10 },
  { label: "A half marathon!", emoji: "🏃‍♂️", distanceKm: 21.1 },
  { label: "A full marathon!", emoji: "🏆", distanceKm: 42.2 },
  { label: "An ultramarathon!", emoji: "⚡", distanceKm: 100 },
  { label: "London to Paris!", emoji: "🗼", distanceKm: 344 },
  { label: "New York to Washington DC!", emoji: "🗽", distanceKm: 365 },
  { label: "Los Angeles to San Francisco!", emoji: "🌉", distanceKm: 615 },
];

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

export const getDistanceMilestone = (totalKm: number): DistanceMilestone | null => {
  const achieved = MILESTONES.filter(m => totalKm >= m.distanceKm);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
};

export const getNextMilestone = (totalKm: number): DistanceMilestone | null => {
  return MILESTONES.find(m => totalKm < m.distanceKm) || null;
};

export const useDistancePlayed = (timeRange: TimeRange) => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  return useQuery({
    queryKey: ["distancePlayed", user?.id, timeRange],
    queryFn: async (): Promise<DistanceData> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      const dateCutoff = getDateCutoff(timeRange);

      let roundsQuery = supabase
        .from("rounds")
        .select("id")
        .eq("user_id", user.id);

      if (dateCutoff) {
        roundsQuery = roundsQuery.gte("played_at", dateCutoff.toISOString());
      }

      const { data: rounds, error: roundsError } = await roundsQuery;
      if (roundsError) throw roundsError;

      if (!rounds || rounds.length === 0) {
        return {
          totalYards: 0,
          totalMiles: 0,
          totalKm: 0,
          holesPlayed: 0,
          roundsPlayed: 0,
        };
      }

      const roundIds = rounds.map(r => r.id);
      const { data: holeStats, error: statsError } = await supabase
        .from("hole_stats")
        .select("yardage")
        .in("round_id", roundIds);

      if (statsError) throw statsError;

      const totalYards = (holeStats || []).reduce((sum, h) => sum + ((h as any).yardage || 0), 0);
      const totalMiles = totalYards / 1760;
      const totalKm = totalYards * 0.0009144;

      return {
        totalYards,
        totalMiles: Math.round(totalMiles * 100) / 100,
        totalKm: Math.round(totalKm * 100) / 100,
        holesPlayed: (holeStats || []).length,
        roundsPlayed: rounds.length,
      };
    },
    enabled: !!user?.id,
  });
};