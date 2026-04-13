import { useMemo, useState } from "react";
import type { TimeRange } from "@/hooks/useRoundStats";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClubScoringStats, type ClubScoringEntry } from "@/hooks/useClubScoringStats";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type ScoringTab = "tee" | "approach" | "scramble";

interface ClubScoringProps {
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
}

const formatAvg = (avg: number) => {
  if (avg === 0) return "E";
  return avg > 0 ? `+${avg.toFixed(2)}` : avg.toFixed(2);
};

const getColor = (avg: number) => {
  if (avg < 0) return "text-green-600 dark:text-green-400";
  if (avg === 0) return "text-muted-foreground";
  if (avg <= 0.5) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

const ClubScoring = ({ timeRange, onTimeRangeChange }: ClubScoringProps) => {
  const [activeTab, setActiveTab] = useState<ScoringTab>("tee");
  const { data: stats, isLoading } = useClubScoringStats(timeRange);
  const { clubs: bagClubs } = useUserPreferences();

  const sortByBag = (entries: ClubScoringEntry[]) => {
    const bagOrder = bagClubs.map((c) => c.name);
    return [...entries].sort((a, b) => {
      const iA = bagOrder.indexOf(a.club);
      const iB = bagOrder.indexOf(b.club);
      if (iA === -1 && iB === -1) return 0;
      if (iA === -1) return 1;
      if (iB === -1) return -1;
      return iA - iB;
    });
  };

  const currentEntries = useMemo(() => {
    if (!stats) return [];
    const raw = activeTab === "tee" ? stats.tee : activeTab === "approach" ? stats.approach : stats.scramble;
    return sortByBag(raw);
  }, [stats, activeTab, bagClubs]);

  const totalHoles = currentEntries.reduce((sum, e) => sum + e.totalHoles, 0);
  const label = activeTab === "tee" ? "tee shots" : activeTab === "approach" ? "approach shots" : "scramble shots";

  return (
    <div>
      {/* Sub-tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ScoringTab)} className="mb-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tee">Tee</TabsTrigger>
          <TabsTrigger value="approach">Approach</TabsTrigger>
          <TabsTrigger value="scramble">Scramble</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Shot count + time range */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          {isLoading ? "Loading..." : totalHoles > 0 ? `Based on ${totalHoles} ${label}` : `No ${label} recorded yet`}
        </p>
        <Select value={timeRange} onValueChange={(v) => onTimeRangeChange(v as TimeRange)}>
          <SelectTrigger className="w-[120px] h-9">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            {(["LAST", "3M", "6M", "1Y", "MAX"] as TimeRange[]).map((range) => (
              <SelectItem key={range} value={range}>
                {range === "LAST" ? "Last Round" : range === "MAX" ? "All Time" : range}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Club list */}
      {currentEntries.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scoring data available.</p>
          <p className="text-sm text-muted-foreground mt-1">Play some rounds to see club scoring stats!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentEntries.map((entry) => (
            <div key={entry.club} className="bg-card rounded-xl p-4 shadow-sm border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">{entry.club}</span>
                  <p className="text-sm text-muted-foreground">{entry.totalHoles} holes</p>
                </div>
                <span className={`text-xl font-bold ${getColor(entry.avgOverPar)}`}>
                  {formatAvg(entry.avgOverPar)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClubScoring;
