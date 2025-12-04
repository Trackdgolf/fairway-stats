import { useState, useMemo } from "react";
import { Trophy, Award, Target, TrendingUp, Grip, MapPin, Flag, Circle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import StatsChart from "@/components/StatsChart";
import StatTile from "@/components/StatTile";
import { useStatPreferences } from "@/hooks/useStatPreferences";
import { useRoundStats } from "@/hooks/useRoundStats";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type StatType = "totalRounds" | "bestScore" | "avgScore" | "avgOverPar" | "avgPutts" | "firPercent" | "girPercent" | "scramblePercent";
type TimeRange = "3M" | "6M" | "1Y" | "MAX";

const Stats = () => {
  const [selectedStat, setSelectedStat] = useState<StatType>("avgOverPar");
  const [timeRange, setTimeRange] = useState<TimeRange>("MAX");
  const [courseFilter, setCourseFilter] = useState("all");
  const { preferences } = useStatPreferences();
  const { data, isLoading } = useRoundStats(timeRange, courseFilter);

  const getChartData = () => {
    if (!data?.timeSeries) return [];
    
    const timeSeriesMap: Record<StatType, { date: string; value: number }[]> = {
      totalRounds: [],
      bestScore: [],
      avgScore: data.timeSeries.avgScore,
      avgOverPar: data.timeSeries.avgOverPar,
      avgPutts: data.timeSeries.avgPutts,
      firPercent: data.timeSeries.firPercent,
      girPercent: data.timeSeries.girPercent,
      scramblePercent: data.timeSeries.scramblePercent,
    };
    
    return timeSeriesMap[selectedStat] || [];
  };

  const getChartTitle = () => {
    const titles: { [key in StatType]: string } = {
      totalRounds: "Total Rounds Over Time",
      bestScore: "Best Score Over Time",
      avgScore: "Average Score Over Time",
      avgOverPar: "Score to Par Over Time",
      avgPutts: "Average Putts Over Time",
      firPercent: "FIR % Over Time",
      girPercent: "GIR % Over Time",
      scramblePercent: "Scramble % Over Time",
    };
    return titles[selectedStat];
  };

  const formatStatValue = (value: number | null, suffix: string = ""): string => {
    if (value === null) return "-";
    return `${value}${suffix}`;
  };

  const allStats = useMemo(() => [
    {
      id: "totalRounds" as StatType,
      icon: Trophy,
      value: data?.stats?.totalRounds?.toString() || "0",
      label: "Total Rounds",
      iconColor: "bg-amber-100 dark:bg-amber-900/30",
      iconTextColor: "text-amber-500",
      isSelectable: false,
      alwaysShow: true,
    },
    {
      id: "bestScore" as StatType,
      icon: Award,
      value: formatStatValue(data?.stats?.bestScore ?? null),
      label: "Best Score",
      iconColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconTextColor: "text-yellow-500",
      isSelectable: false,
      alwaysShow: true,
    },
    {
      id: "avgScore" as StatType,
      icon: Target,
      value: formatStatValue(data?.stats?.avgScore ?? null),
      label: "Average Score",
      iconColor: "bg-blue-100 dark:bg-blue-900/30",
      iconTextColor: "text-blue-500",
      isSelectable: true,
      alwaysShow: true,
    },
    {
      id: "avgOverPar" as StatType,
      icon: TrendingUp,
      value: data?.stats?.avgOverPar != null ? `+${data.stats.avgOverPar}` : "-",
      label: "Avg Over Par",
      iconColor: "bg-red-100 dark:bg-red-900/30",
      iconTextColor: "text-red-500",
      isSelectable: true,
      alwaysShow: true,
    },
    {
      id: "avgPutts" as StatType,
      icon: Grip,
      value: formatStatValue(data?.stats?.avgPutts ?? null),
      label: "Avg Putts",
      iconColor: "bg-purple-100 dark:bg-purple-900/30",
      iconTextColor: "text-purple-500",
      isSelectable: true,
      preferenceKey: "putts" as const,
    },
    {
      id: "firPercent" as StatType,
      icon: MapPin,
      value: formatStatValue(data?.stats?.firPercent ?? null, "%"),
      label: "FIR %",
      iconColor: "bg-green-100 dark:bg-green-900/30",
      iconTextColor: "text-green-500",
      isSelectable: true,
      preferenceKey: "fir" as const,
    },
    {
      id: "girPercent" as StatType,
      icon: Flag,
      value: formatStatValue(data?.stats?.girPercent ?? null, "%"),
      label: "GIR %",
      iconColor: "bg-pink-100 dark:bg-pink-900/30",
      iconTextColor: "text-pink-500",
      isSelectable: true,
      preferenceKey: "gir" as const,
    },
    {
      id: "scramblePercent" as StatType,
      icon: Circle,
      value: formatStatValue(data?.stats?.scramblePercent ?? null, "%"),
      label: "Scramble %",
      iconColor: "bg-orange-100 dark:bg-orange-900/30",
      iconTextColor: "text-orange-500",
      isSelectable: true,
      preferenceKey: "scramble" as const,
    },
  ], [data?.stats]);

  const stats = useMemo(() => {
    return allStats.filter(stat => {
      if (stat.alwaysShow) return true;
      if (stat.preferenceKey) return preferences[stat.preferenceKey];
      return true;
    });
  }, [preferences, allStats]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20 relative">
      <PageHeader />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-6 pt-4">
          <h1 className="text-3xl font-bold text-foreground mb-2">Your Statistics</h1>
          <p className="text-muted-foreground">Track your golf performance</p>
        </div>

        {/* Chart */}
        {isLoading ? (
          <Skeleton className="h-64 w-full mb-4 rounded-lg" />
        ) : (
          <StatsChart
            data={getChartData()}
            title={getChartTitle()}
            yAxisLabel="Value"
          />
        )}

        {/* Course Filter */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Course:</span>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="flex-1 bg-card border-border">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All Courses</SelectItem>
              {data?.stats.courses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Time Range Buttons */}
        <div className="flex gap-2 mb-6">
          {(["3M", "6M", "1Y", "MAX"] as TimeRange[]).map((range) => (
            <Button
              key={range}
              onClick={() => setTimeRange(range)}
              variant={timeRange === range ? "default" : "outline"}
              className={timeRange === range ? "" : "bg-muted text-muted-foreground hover:bg-muted/80"}
            >
              {range}
            </Button>
          ))}
        </div>

        {/* Stat Tiles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <StatTile
                key={stat.id}
                icon={stat.icon}
                value={stat.value}
                label={stat.label}
                isSelected={selectedStat === stat.id}
                onClick={() => setSelectedStat(stat.id)}
                iconColor={stat.iconColor}
                iconTextColor={stat.iconTextColor}
                isSelectable={stat.isSelectable}
              />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
