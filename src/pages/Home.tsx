import { useState, useEffect } from "react";
import { Play, Settings, Clock, Flag, Pencil, LogOut, Share2, Loader2, ChevronDown, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStreakTrackers } from "@/hooks/useStreakTrackers";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { TrackdHandicap } from "@/components/TrackdHandicap";
import { PaywallModal } from "@/components/PaywallModal";
import { WelcomeModal } from "@/components/WelcomeModal";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import RoundSummaryModal from "@/components/RoundSummaryModal";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { useTheme } from "next-themes";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

interface InProgressRound {
  id: string;
  course_data: {
    course_name?: string;
    club_name?: string;
    id?: string | number;
    holes?: Array<{ par?: number }>;
  };
  hole_stats: Array<{
    score: number | null;
    fir: boolean | null;
    firDirection: string | null;
    gir: boolean | null;
    girDirection: string | null;
    scramble: string | null;
    putts: number | null;
    teeClub: string;
    approachClub: string;
    scrambleClub: string;
    scrambleShotType: string | null;
  }>;
  current_hole_index: number;
  updated_at: string;
}

interface CompletedRound {
  id: string;
  course_name: string;
  total_score: number | null;
  played_at: string | null;
  hole_stats: Array<{ par: number | null }>;
}

const formatScoreVsPar = (totalScore: number | null, holeStats: Array<{ par: number | null }>) => {
  if (totalScore === null || !holeStats || holeStats.length === 0) return null;
  
  const totalPar = holeStats.reduce((sum, hole) => sum + (hole.par || 0), 0);
  if (totalPar === 0) return null;
  
  const difference = totalScore - totalPar;
  
  if (difference === 0) return "E";
  if (difference > 0) return `+${difference}`;
  return `${difference}`;
};

const Home = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { resolvedTheme } = useTheme();
  const supabase = getSupabaseClient();
  const queryClient = useQueryClient();
  const { isPremium } = usePremiumStatus();
  const { threePutt, doubleBogey, penalty, isLoading: streaksLoading } = useStreakTrackers();
  const [showPaywall, setShowPaywall] = useState(false);
  const [recentOpen, setRecentOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    courseName: string;
    totalScore: number | null;
    holeStats: Array<{ score: number | null; fir: boolean | null; gir: boolean | null; scramble: 'yes' | 'no' | 'n/a' | null; putts: number | null; par: number | null }>;
    roundId: string;
  } | null>(null);
  const [loadingShareId, setLoadingShareId] = useState<string | null>(null);

  const handleShareRound = async (round: CompletedRound) => {
    setLoadingShareId(round.id);
    try {
      const { data, error } = await supabase
        .from('hole_stats')
        .select('score, par, fir, gir, scramble, putts')
        .eq('round_id', round.id)
        .order('hole_number');

      if (error) throw error;

      setSummaryData({
        courseName: round.course_name,
        totalScore: round.total_score,
        roundId: round.id,
        holeStats: (data || []).map(h => ({
          score: h.score,
          fir: h.fir,
          gir: h.gir,
          scramble: h.scramble as 'yes' | 'no' | 'n/a' | null,
          putts: h.putts,
          par: h.par,
        })),
      });
      setShowSummary(true);
    } catch (err) {
      console.error('Failed to fetch hole stats:', err);
    } finally {
      setLoadingShareId(null);
    }
  };

  // Check if user has seen welcome modal
  const { data: profile } = useQuery({
    queryKey: ["profile-welcome", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("has_seen_welcome")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Show welcome modal if user hasn't seen it
  useEffect(() => {
    if (profile && profile.has_seen_welcome === false) {
      setShowWelcome(true);
    }
  }, [profile]);

  const handleWelcomeClose = async () => {
    setShowWelcome(false);
    if (user) {
      await supabase
        .from("profiles")
        .update({ has_seen_welcome: true })
        .eq("id", user.id);
      // Invalidate the query so it doesn't show again
      queryClient.invalidateQueries({ queryKey: ["profile-welcome", user.id] });
    }
  };

  // Fetch in-progress rounds
  const { data: inProgressRounds } = useQuery({
    queryKey: ["in-progress-rounds", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("in_progress_rounds")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as unknown as InProgressRound[];
    },
    enabled: !!user,
  });

  // Fetch completed rounds
  const { data: completedRounds } = useQuery({
    queryKey: ["completed-rounds", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("rounds")
        .select("id, course_name, total_score, played_at, hole_stats(par)")
        .eq("user_id", user.id)
        .order("played_at", { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return (data || []) as CompletedRound[];
    },
    enabled: !!user,
  });


  const handleContinueRound = (round: InProgressRound) => {
    navigate("/round", {
      state: {
        course: round.course_data,
        inProgressRoundId: round.id,
        restoredStats: round.hole_stats,
        restoredHoleIndex: round.current_hole_index,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
      <PageHeader height="h-40" />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center relative">
          <button
            onClick={() => navigate('/settings')}
            className="absolute right-0 top-0 p-2 text-header-foreground hover:text-header-foreground/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
          <img 
            src={resolvedTheme === "dark" ? logoLight : logoDark} 
            alt="TRACKD" 
            className="h-32"
          />
        </div>

        {/* Start Round Card - overlaps header */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-1">Ready to play?</h2>
              <p className="text-primary-foreground/90 text-sm">Start tracking your round</p>
            </div>
            <Flag className="w-12 h-12 opacity-80" />
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

        {/* In Progress Rounds */}
        {inProgressRounds && inProgressRounds.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-accent" />
              In Progress
            </h3>
            <div className="space-y-3">
              {inProgressRounds.map((round) => (
                <Card 
                  key={round.id} 
                  className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleContinueRound(round)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">
                        {round.course_data?.course_name || round.course_data?.club_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Hole {round.current_hole_index + 1} of {round.course_data?.holes?.length || 18}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Continue
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trackd Handicap - Free for all users */}
        <div className="mb-6">
          <TrackdHandicap />
        </div>

        {/* Streak Tracker Tiles */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <Card className="p-3 text-center">
            <ShieldCheck className="w-7 h-7 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-foreground">{streaksLoading ? "–" : threePutt.current}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-tight">Holes since last 3-putt</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Longest: {streaksLoading ? "–" : threePutt.longest}</p>
          </Card>
          <Card className="p-3 text-center">
            <ShieldAlert className="w-7 h-7 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-foreground">{streaksLoading ? "–" : doubleBogey.current}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-tight">Holes since last double bogey+</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Longest: {streaksLoading ? "–" : doubleBogey.longest}</p>
          </Card>
          <Card className="p-3 text-center">
            <AlertTriangle className="w-7 h-7 mx-auto mb-2 text-accent" />
            <p className="text-2xl font-bold text-foreground">{streaksLoading ? "–" : penalty.current}</p>
            <p className="text-[11px] font-medium text-muted-foreground mt-1 leading-tight">Holes since last penalty</p>
            <p className="text-[10px] text-muted-foreground/70 mt-1">Longest: {streaksLoading ? "–" : penalty.longest}</p>
          </Card>
        </div>

        {/* Recent Rounds - Collapsible */}
        <Collapsible open={recentOpen} onOpenChange={setRecentOpen} className="mb-6">
          <CollapsibleTrigger className="flex items-center justify-between w-full py-2">
            <h3 className="text-lg font-semibold text-foreground">Recent Rounds</h3>
            <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${recentOpen ? "rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            {completedRounds && completedRounds.length > 0 ? (
              <div className="space-y-3">
                {completedRounds.map((round) => (
                  <Card key={round.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{round.course_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {round.played_at ? format(new Date(round.played_at), "MMM d, yyyy") : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xl font-bold text-foreground">
                            {round.total_score ?? "--"}
                          </p>
                          {formatScoreVsPar(round.total_score, round.hole_stats) && (
                            <p className="text-sm font-medium text-primary">
                              {formatScoreVsPar(round.total_score, round.hole_stats)}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShareRound(round); }}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={loadingShareId === round.id}
                        >
                          {loadingShareId === round.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Share2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => navigate(`/edit-round/${round.id}`)}
                          className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center">
                <p className="text-muted-foreground">No rounds yet</p>
                <p className="text-sm text-muted-foreground mt-1">Start your first round to see it here</p>
              </Card>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Sign Out Button with Confirmation */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to sign out of your account?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={signOut}>Sign Out</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <BottomNav />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      <WelcomeModal open={showWelcome} onClose={handleWelcomeClose} />
      {summaryData && (
        <RoundSummaryModal
          open={showSummary}
          onClose={() => { setShowSummary(false); setSummaryData(null); }}
          courseName={summaryData.courseName}
          totalScore={summaryData.totalScore}
          holeStats={summaryData.holeStats}
          roundId={summaryData.roundId}
        />
      )}
    </div>
  );
};

export default Home;
