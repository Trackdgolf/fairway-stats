import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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

      // Note: yardage column doesn't exist yet in hole_stats.
      // Distance will show 0 until the column is added via migration.
      return {
        totalYards: 0,
        totalMiles: 0,
        totalKm: 0,
        holesPlayed: 0,
        roundsPlayed: rounds.length,
      };
    },
    enabled: !!user?.id,
  });
};