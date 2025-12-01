import { Play, Trophy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">GolfTrack</h1>
          <p className="text-muted-foreground">Track your game, improve your score</p>
        </div>

        {/* Start Round Card */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Ready to play?</h2>
              <p className="text-primary-foreground/90 text-sm">Start tracking your round</p>
            </div>
            <Trophy className="w-12 h-12 opacity-80" />
          </div>
          <Button 
            size="lg" 
            className="w-full bg-card text-card-foreground hover:bg-card/90 shadow-md"
            onClick={() => navigate('/course-search')}
          >
            <Play className="w-5 h-5 mr-2" />
            Start New Round
          </Button>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Rounds Played</span>
            </div>
            <p className="text-2xl font-bold text-foreground">0</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent" />
              <span className="text-sm text-muted-foreground">Best Score</span>
            </div>
            <p className="text-2xl font-bold text-foreground">--</p>
          </Card>
        </div>

        {/* Recent Rounds */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Recent Rounds</h3>
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">No rounds yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start your first round to see it here</p>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;
