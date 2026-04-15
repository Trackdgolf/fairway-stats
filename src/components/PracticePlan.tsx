import { useState } from "react";
import { Loader2, Sparkles, Download, Clock, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { drillData, difficultyColor, type Drill, type Difficulty } from "@/components/DrillLibrary";

interface WeaknessResult {
  category: string;
  statLabel: string;
  statValue: string;
  contextLine: string;
  severity: number; // higher = worse
}

interface DrillRecommendation {
  weakness: WeaknessResult;
  drill: Drill;
}

const pickDrillForLevel = (drills: Drill[], severity: number): Drill => {
  const difficultyOrder: Record<Difficulty, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };
  const sorted = [...drills].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  // High severity → beginner drills, low severity → harder drills
  if (severity >= 0.7) return sorted[0]; // worst → easiest drill
  if (severity >= 0.4) return sorted[Math.min(1, sorted.length - 1)];
  return sorted[sorted.length - 1]; // mildly weak → hardest drill
};

const PracticePlan = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<DrillRecommendation[]>([]);
  const [introLine, setIntroLine] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  const computeStats = async () => {
    const supabase = getSupabaseClient();

    const { data: rounds, error: roundsErr } = await supabase
      .from("rounds")
      .select("id")
      .eq("user_id", user!.id)
      .order("played_at", { ascending: false })
      .limit(5);

    if (roundsErr) throw roundsErr;
    if (!rounds?.length) return null;

    const roundIds = rounds.map((r) => r.id);
    const { data: holes, error: holesErr } = await supabase
      .from("hole_stats")
      .select("fir, gir, putts, scramble, par")
      .in("round_id", roundIds);

    if (holesErr) throw holesErr;
    if (!holes?.length) return null;

    const firHoles = holes.filter((h) => h.par !== 3 && h.fir !== null);
    const firPercent = firHoles.length ? Math.round((firHoles.filter((h) => h.fir).length / firHoles.length) * 100) : 0;

    const girHoles = holes.filter((h) => h.gir !== null);
    const girPercent = girHoles.length ? Math.round((girHoles.filter((h) => h.gir).length / girHoles.length) * 100) : 0;

    const puttsHoles = holes.filter((h) => h.putts !== null);
    const totalPutts = puttsHoles.reduce((s, h) => s + (h.putts ?? 0), 0);
    const avgPutts = rounds.length ? Math.round((totalPutts / rounds.length) * 10) / 10 : 0;

    const scrambleHoles = holes.filter((h) => h.scramble !== null && h.gir === false);
    const madeScrambles = scrambleHoles.filter((h) => h.scramble === "yes" || h.scramble === "sand_save");
    const scramblePercent = scrambleHoles.length ? Math.round((madeScrambles.length / scrambleHoles.length) * 100) : 0;

    return { firPercent, girPercent, avgPutts, scramblePercent, roundCount: rounds.length };
  };

  const identifyWeaknesses = (stats: { firPercent: number; girPercent: number; avgPutts: number; scramblePercent: number }): WeaknessResult[] => {
    const weaknesses: WeaknessResult[] = [];

    // Putting: >32 putts/round is weak, >36 is very weak
    if (stats.avgPutts > 32) {
      const severity = Math.min((stats.avgPutts - 32) / 8, 1);
      weaknesses.push({
        category: "Putting",
        statLabel: "Avg Putts",
        statValue: `${stats.avgPutts}`,
        contextLine: `You're averaging ${stats.avgPutts} putts per round — reducing this is the fastest way to lower your scores.`,
        severity,
      });
    }

    // Driving: <60% FIR is weak
    if (stats.firPercent < 60) {
      const severity = Math.min((60 - stats.firPercent) / 40, 1);
      weaknesses.push({
        category: "Driving",
        statLabel: "FIR%",
        statValue: `${stats.firPercent}%`,
        contextLine: `Your FIR is ${stats.firPercent}% — finding more fairways will set up easier approach shots.`,
        severity,
      });
    }

    // Approach: <50% GIR is weak
    if (stats.girPercent < 50) {
      const severity = Math.min((50 - stats.girPercent) / 30, 1);
      weaknesses.push({
        category: "Approach Play",
        statLabel: "GIR%",
        statValue: `${stats.girPercent}%`,
        contextLine: `Your GIR is ${stats.girPercent}% — hitting more greens means fewer scramble situations.`,
        severity,
      });
    }

    // Scrambling: <40% is weak
    if (stats.scramblePercent < 40) {
      const severity = Math.min((40 - stats.scramblePercent) / 30, 1);
      // Alternate between Short Game and Up & Down
      const category = severity >= 0.5 ? "Short Game" : "Up & Down";
      weaknesses.push({
        category,
        statLabel: "Scramble%",
        statValue: `${stats.scramblePercent}%`,
        contextLine: `Your scrambling is at ${stats.scramblePercent}% — saving par from off the green will make a big difference.`,
        severity,
      });
    }

    // Sort by severity descending
    weaknesses.sort((a, b) => b.severity - a.severity);

    // If no clear weaknesses, suggest course management
    if (weaknesses.length === 0) {
      weaknesses.push({
        category: "Course Management",
        statLabel: "Overall",
        statValue: "Solid",
        contextLine: "Your stats look strong across the board — let's sharpen your course management to take your game to the next level.",
        severity: 0.3,
      });
    }

    return weaknesses.slice(0, 3);
  };

  const handleGenerate = async () => {
    if (!user) return;
    setIsLoading(true);
    setRecommendations([]);
    setIntroLine("");

    try {
      const stats = await computeStats();
      if (!stats) {
        toast({ title: "Make sure you have at least 1 round logged and try again.", variant: "destructive" });
        setIsLoading(false);
        return;
      }

      const weaknesses = identifyWeaknesses(stats);
      const recs: DrillRecommendation[] = [];

      for (const weakness of weaknesses) {
        const categoryData = drillData.find((c) => c.category === weakness.category);
        if (!categoryData || categoryData.drills.length === 0) continue;
        const drill = pickDrillForLevel(categoryData.drills, weakness.severity);
        recs.push({ weakness, drill });
      }

      const roundWord = stats.roundCount === 1 ? "round" : "rounds";
      setIntroLine(`Based on your last ${stats.roundCount} ${roundWord}, here's what to work on this week:`);
      setRecommendations(recs);
      setHasGenerated(true);
    } catch (err) {
      console.error("Practice plan error:", err);
      toast({ title: "Something went wrong — please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    let text = `TRACKD Caddy 🏌️ - Practice Plan\n${"=".repeat(40)}\n\n${introLine}\n`;
    for (const rec of recommendations) {
      text += `\n---\n${rec.weakness.contextLine}\n\nDrill: ${rec.drill.title} (${rec.drill.difficulty})\nDuration: ${rec.drill.durationMins} min\nEquipment: ${rec.drill.equipment}\n\n${rec.drill.description}\n\n💡 ${rec.drill.coachingCue}\n`;
    }
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trackd-practice-plan.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6">
      <Button
        onClick={handleGenerate}
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analysing your stats...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            {hasGenerated ? "Refresh Practice Plan" : "Get My Practice Plan"}
          </>
        )}
      </Button>

      {recommendations.length > 0 && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              TRACKD Caddy 🏌️
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{introLine}</p>

            {recommendations.map((rec, idx) => (
              <div key={idx} className="rounded-lg border bg-secondary/50 p-4 space-y-2">
                <p className="text-sm font-medium text-foreground">{rec.weakness.contextLine}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{rec.weakness.category}</Badge>
                  <Badge className={`text-xs ${difficultyColor[rec.drill.difficulty]}`}>
                    {rec.drill.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {rec.drill.durationMins} min
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-foreground">{rec.drill.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.drill.description}</p>
                <div className="bg-primary/10 rounded-md p-2">
                  <p className="text-xs text-primary font-medium">💡 {rec.drill.coachingCue}</p>
                </div>
              </div>
            ))}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => navigate("/golf-school")}
              >
                <BookOpen className="w-4 h-4" />
                View All Drills
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PracticePlan;
