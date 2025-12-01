import { Activity, Target, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";

const ClubPerformance = () => {
  const clubs = [
    { name: "Driver", avgDistance: "--", accuracy: "--" },
    { name: "3 Wood", avgDistance: "--", accuracy: "--" },
    { name: "5 Iron", avgDistance: "--", accuracy: "--" },
    { name: "7 Iron", avgDistance: "--", accuracy: "--" },
    { name: "9 Iron", avgDistance: "--", accuracy: "--" },
    { name: "Pitching Wedge", avgDistance: "--", accuracy: "--" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Club Performance</h1>
          <p className="text-muted-foreground">Analyze your club statistics</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Most Used</span>
            </div>
            <p className="text-lg font-bold text-foreground">--</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Best Club</span>
            </div>
            <p className="text-lg font-bold text-foreground">--</p>
          </Card>
        </div>

        {/* Club List */}
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Your Clubs</h3>
          <div className="space-y-3">
            {clubs.map((club, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">{club.name}</h4>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Avg: {club.avgDistance}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Accuracy: {club.accuracy}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card className="p-6 text-center mt-6">
          <p className="text-muted-foreground">Track shots to see performance data</p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default ClubPerformance;
