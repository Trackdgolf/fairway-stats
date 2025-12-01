import { TrendingUp, Target, Award, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const Stats = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Statistics</h1>
          <p className="text-muted-foreground">Track your progress over time</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Fairways Hit</span>
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">GIR</span>
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Total Rounds</span>
            </div>
            <p className="text-2xl font-bold text-foreground">0</p>
          </Card>
        </div>

        {/* Performance Chart Placeholder */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Score Trends</h3>
          <div className="h-48 flex items-center justify-center bg-muted rounded-lg">
            <p className="text-muted-foreground">Chart will appear after playing rounds</p>
          </div>
        </Card>

        {/* Round History */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Round History</h3>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No rounds recorded yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start tracking to see your history</p>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Stats;
