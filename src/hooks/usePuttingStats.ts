import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { TimeRange } from "@/hooks/useRoundStats";

export type PuttDistanceBucket = '0-3' | '4-8' | '9-14' | '15+';
export type PuttOutcome = 'holed' | 'short' | 'long' | 'left' | 'right' | 'lipped_out';

export interface PuttBucketStats {
  bucket: PuttDistanceBucket;
  total: number;
  holed: number;
  short: number;
  long: number;
  left: number;
  right: number;
  lippedOut: number;
  makePercent: number;
}

export interface PuttingStats {
  total: number;
  buckets: PuttBucketStats[];
}

const BUCKET_ORDER: PuttDistanceBucket[] = ['0-3', '4-8', '9-14', '15+'];

const getDateCutoff = (timeRange: TimeRange): Date | null => {
  if (timeRange === "MAX" || timeRange === "LAST") return null;
  const now = new Date();
  switch (timeRange) {
    case "3M": return new Date(now.setMonth(now.getMonth() - 3));
    case "6M": return new Date(now.setMonth(now.getMonth() - 6));
    case "1Y": return new Date(now.setFullYear(now.getFullYear() - 1));
    default: return null;
  }
};

const emptyStats = (): PuttingStats => ({
  total: 0,
  buckets: BUCKET_ORDER.map((bucket) => ({
    bucket,
    total: 0,
    holed: 0,
    short: 0,
    long: 0,
    left: 0,
    right: 0,
    lippedOut: 0,
    makePercent: 0,
  })),
});

export const usePuttingStats = (timeRange: TimeRange = "MAX") => {
  const supabase = getSupabaseClient();

  return useQuery({
    queryKey: ["putting-stats", timeRange],
    queryFn: async (): Promise<PuttingStats> => {
      let roundsQuery = supabase
        .from("rounds")
        .select("id, played_at")
        .order("played_at", { ascending: false });

      const cutoff = getDateCutoff(timeRange);
      if (cutoff) {
        roundsQuery = roundsQuery.gte("played_at", cutoff.toISOString());
      }

      const { data: rounds, error: roundsError } = await roundsQuery;
      if (roundsError) throw roundsError;

      const qualifying = timeRange === "LAST"
        ? (rounds && rounds.length > 0 ? [rounds[0].id] : [])
        : (rounds || []).map((r) => r.id);

      if (qualifying.length === 0) return emptyStats();

      const { data: putts, error } = await supabase
        .from("putt_details")
        .select("distance_bucket, outcome")
        .in("round_id", qualifying);

      if (error) throw error;

      const stats = emptyStats();
      const map = new Map<PuttDistanceBucket, PuttBucketStats>();
      stats.buckets.forEach((b) => map.set(b.bucket, b));

      (putts || []).forEach((p) => {
        const bucket = map.get(p.distance_bucket as PuttDistanceBucket);
        if (!bucket) return;
        bucket.total += 1;
        stats.total += 1;
        switch (p.outcome as PuttOutcome) {
          case 'holed': bucket.holed += 1; break;
          case 'short': bucket.short += 1; break;
          case 'long': bucket.long += 1; break;
          case 'left': bucket.left += 1; break;
          case 'right': bucket.right += 1; break;
          case 'lipped_out': bucket.lippedOut += 1; break;
        }
      });

      stats.buckets.forEach((b) => {
        b.makePercent = b.total > 0 ? Math.round((b.holed / b.total) * 100) : 0;
      });

      return stats;
    },
  });
};
