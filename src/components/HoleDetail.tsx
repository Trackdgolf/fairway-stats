import { ChevronLeft, Target, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHoleHistory } from "@/hooks/useHoleHistory";
import type { HolePerformance } from "@/hooks/useCoursePerformance";

interface HoleDetailProps {
  courseId: string;
  courseName: string;
  hole: HolePerformance;
  onBack: () => void;
}

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
};

const getScoreLabel = (score: number, par: number) => {
  const diff = score - par;
  if (diff === 0) return "Par";
  if (diff === -1) return "Birdie";
  if (diff === -2) return "Eagle";
  if (diff < -2) return `${diff}`;
  if (diff === 1) return "Bogey";
  if (diff === 2) return "Double";
  return `+${diff}`;
};

const getScoreColor = (score: number, par: number) => {
  const diff = score - par;
  if (diff < 0) return "text-green-500";
  if (diff === 0) return "text-yellow-500";
  if (diff === 1) return "text-orange-400";
  return "text-red-500";
};

const getTeeResult = (fir: boolean | null, firDirection: string | null, par: number) => {
  const hitLabel = par === 3 ? "Green Hit" : "Fairway Hit";
  if (fir === null) return { label: "No data", color: "text-muted-foreground" };
  if (fir) return { label: hitLabel, color: "text-green-500" };
  if (firDirection === "left") return { label: "Missed Left", color: "text-orange-400" };
  if (firDirection === "right") return { label: "Missed Right", color: "text-orange-400" };
  if (firDirection === "short") return { label: "Missed Short", color: "text-orange-400" };
  if (firDirection === "long") return { label: "Missed Long", color: "text-orange-400" };
  if (firDirection === "penalty") return { label: "Penalty", color: "text-red-500" };
  return { label: "Missed", color: "text-muted-foreground" };
};

const HoleDetail = ({ courseId, courseName, hole, onBack }: HoleDetailProps) => {
  const { data: history, isLoading } = useHoleHistory(courseId, hole.holeNumber);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hole {hole.holeNumber}</h1>
          <p className="text-sm text-muted-foreground">Par {hole.par} · {courseName}</p>
        </div>
      </div>

      {/* Summary card */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
              <p className="text-xl font-bold">{hole.avgScore.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg vs Par</p>
              <p className={`text-xl font-bold ${getScoreColor(hole.avgScore, hole.par)}`}>
                {hole.avgOverPar > 0 ? `+${hole.avgOverPar.toFixed(1)}` : hole.avgOverPar === 0 ? "E" : hole.avgOverPar.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Personal SI</p>
              <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs">
                {hole.personalStrokeIndex}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent plays */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Rounds</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : !history?.length ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground text-sm">
              No hole data available yet.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {history.map((play, i) => {
              const teeResult = getTeeResult(play.fir, play.firDirection, play.par);
              return (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">{formatDate(play.playedAt)}</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-bold ${getScoreColor(play.score, play.par)}`}>
                          {play.score}
                        </span>
                        <span className={`text-xs font-medium ${getScoreColor(play.score, play.par)}`}>
                          {getScoreLabel(play.score, play.par)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1.5">
                        <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{play.teeClub || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Target className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className={teeResult.color}>{teeResult.label}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HoleDetail;
