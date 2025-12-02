import { useState } from "react";
import { Trophy, Award, Target, TrendingUp, Navigation, MapPin, Flag, Circle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import StatsChart from "@/components/StatsChart";
import StatTile from "@/components/StatTile";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type StatType = "totalRounds" | "bestScore" | "avgScore" | "avgOverPar" | "avgPutts" | "firPercent" | "girPercent" | "scramblePercent";
type TimeRange = "3M" | "6M" | "1Y" | "MAX";

const Stats = () => {
  const [selectedStat, setSelectedStat] = useState<StatType>("avgOverPar");
  const [timeRange, setTimeRange] = useState<TimeRange>("MAX");
  const [courseFilter, setCourseFilter] = useState("all");

  // Mock data for demonstration
  const generateMockData = (stat: StatType, range: TimeRange) => {
    const dataPoints: { [key in TimeRange]: number } = {
      "3M": 3,
      "6M": 6,
      "1Y": 12,
      "MAX": 24
    };

    const points = dataPoints[range];
    const data = [];

    for (let i = points; i > 0; i--) {
      const monthsAgo = i;
      const date = new Date();
      date.setMonth(date.getMonth() - monthsAgo);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });

      let value = 0;
      
      switch (stat) {
        case "totalRounds":
          value = Math.floor(Math.random() * 3) + 1;
          break;
        case "bestScore":
          value = Math.floor(Math.random() * 10) + 80;
          break;
        case "avgScore":
          value = Math.floor(Math.random() * 8) + 82;
          break;
        case "avgOverPar":
          value = Math.random() * 8 + 10;
          break;
        case "avgPutts":
          value = Math.random() * 0.8 + 1.4;
          break;
        case "firPercent":
          value = Math.random() * 30 + 30;
          break;
        case "girPercent":
          value = Math.random() * 20 + 20;
          break;
        case "scramblePercent":
          value = Math.random() * 30 + 30;
          break;
      }

      data.push({
        date: `${monthName}`,
        value: parseFloat(value.toFixed(1)),
      });
    }

    return data;
  };

  const chartData = generateMockData(selectedStat, timeRange);

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

  const stats = [
    {
      id: "totalRounds" as StatType,
      icon: Trophy,
      value: "2",
      label: "Total Rounds",
      iconColor: "bg-amber-100 dark:bg-amber-900/30",
      iconTextColor: "text-amber-500",
      isSelectable: false,
    },
    {
      id: "bestScore" as StatType,
      icon: Award,
      value: "84",
      label: "Best Score",
      iconColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconTextColor: "text-yellow-500",
      isSelectable: false,
    },
    {
      id: "avgScore" as StatType,
      icon: Target,
      value: "85",
      label: "Average Score",
      iconColor: "bg-blue-100 dark:bg-blue-900/30",
      iconTextColor: "text-blue-500",
      isSelectable: true,
    },
    {
      id: "avgOverPar" as StatType,
      icon: TrendingUp,
      value: "+13.5",
      label: "Avg Over Par",
      iconColor: "bg-red-100 dark:bg-red-900/30",
      iconTextColor: "text-red-500",
      isSelectable: true,
    },
    {
      id: "avgPutts" as StatType,
      icon: Navigation,
      value: "1.7",
      label: "Avg Putts",
      iconColor: "bg-purple-100 dark:bg-purple-900/30",
      iconTextColor: "text-purple-500",
      isSelectable: true,
    },
    {
      id: "firPercent" as StatType,
      icon: MapPin,
      value: "37%",
      label: "FIR %",
      iconColor: "bg-green-100 dark:bg-green-900/30",
      iconTextColor: "text-green-500",
      isSelectable: true,
    },
    {
      id: "girPercent" as StatType,
      icon: Flag,
      value: "26%",
      label: "GIR %",
      iconColor: "bg-emerald-100 dark:bg-emerald-900/30",
      iconTextColor: "text-emerald-500",
      isSelectable: true,
    },
    {
      id: "scramblePercent" as StatType,
      icon: Circle,
      value: "41%",
      label: "Scramble %",
      iconColor: "bg-orange-100 dark:bg-orange-900/30",
      iconTextColor: "text-orange-500",
      isSelectable: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Statistics</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Chart */}
        <StatsChart
          data={chartData}
          title={getChartTitle()}
          yAxisLabel="Value"
        />

        {/* Course Filter */}
        <div className="mb-4 flex items-center gap-3">
          <span className="text-sm font-medium text-foreground">Course:</span>
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="flex-1 bg-card border-border">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border z-50">
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="course1">Pebble Beach</SelectItem>
              <SelectItem value="course2">Augusta National</SelectItem>
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
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
