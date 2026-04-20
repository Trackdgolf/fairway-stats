import { useState, useMemo } from "react";
import { Target, CircleDot, MapPin, Flag, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHoleHistory, type HolePlay } from "@/hooks/useHoleHistory";
import { useCoursePerformance } from "@/hooks/useCoursePerformance";
import TeeOutcomeDispersion from "@/components/TeeOutcomeDispersion";
import ScrambleOutcomeDispersion from "@/components/ScrambleOutcomeDispersion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface HoleInsightsContentProps {
  courseId: string;
  holeNumber: number;
  par: number;
  /** Optional pre-computed summary (used when caller already has aggregates) */
  avgScore?: number;
  avgOverPar?: number;
  personalStrokeIndex?: number;
  /** Whether to show the summary card. Defaults to true. */
  showSummary?: boolean;
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

const cap = (s: string | null) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

const HoleInsightsContent = ({
  courseId,
  holeNumber,
  par,
  avgScore,
  avgOverPar,
  personalStrokeIndex,
  showSummary = true,
}: HoleInsightsContentProps) => {
  const { data: history, isLoading } = useHoleHistory(courseId, holeNumber);
  const { data: courses } = useCoursePerformance();
  const [activeTab, setActiveTab] = useState<"tee" | "scramble">("tee");

  const scrambleAttempts: HolePlay[] = (history || []).filter(
    (p) => p.gir === false && (p.scramble === "yes" || p.scramble === "no")
  );

  // Locally compute summary if not provided by caller
  const computed = useMemo(() => {
    if (!history?.length) return null;
    const scores = history.map((h) => h.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return {
      avgScore: avg,
      avgOverPar: avg - par,
    };
  }, [history, par]);

  // Resolve personal SI from course performance data when not passed in
  const resolvedSI = useMemo(() => {
    if (personalStrokeIndex != null) return personalStrokeIndex;
    const course = courses?.find((c) => c.courseId === courseId);
    return course?.holes.find((h) => h.holeNumber === holeNumber)?.personalStrokeIndex;
  }, [personalStrokeIndex, courses, courseId, holeNumber]);

  const summaryAvg = avgScore ?? computed?.avgScore;
  const summaryOver = avgOverPar ?? computed?.avgOverPar;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  const hasData = (history?.length ?? 0) > 0;

  return (
    <div className="space-y-4">
      {/* Summary card */}
      {showSummary && hasData && summaryAvg != null && summaryOver != null && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg Score</p>
                <p className="text-xl font-bold">{summaryAvg.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Avg vs Par</p>
                <p className={`text-xl font-bold ${getScoreColor(summaryAvg, par)}`}>
                  {summaryOver > 0 ? `+${summaryOver.toFixed(1)}` : summaryOver === 0 ? "E" : summaryOver.toFixed(1)}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-muted-foreground mb-1">Personal SI</p>
                {personalStrokeIndex != null ? (
                  <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs">
                    {personalStrokeIndex}
                  </Badge>
                ) : (
                  <span className="text-xl font-bold text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasData && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground text-sm">
            No data for this hole yet — play it once to see insights.
          </CardContent>
        </Card>
      )}

      {/* Dispersion analytics tabs */}
      {hasData && history && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "tee" | "scramble")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tee">Tee Shot</TabsTrigger>
            <TabsTrigger value="scramble">Scramble</TabsTrigger>
          </TabsList>
          <TabsContent value="tee" className="mt-4">
            <TeeOutcomeDispersion history={history} par={par} />
          </TabsContent>
          <TabsContent value="scramble" className="mt-4">
            <ScrambleOutcomeDispersion history={history} />
          </TabsContent>
        </Tabs>
      )}

      {/* Recent plays */}
      {hasData && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent Rounds</h2>
          {activeTab === "tee" ? (
            <div className="space-y-2">
              {history!.slice(0, 5).map((play, i) => {
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
          ) : !scrambleAttempts.length ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground text-sm">
                No scramble attempts recorded for this hole yet.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {scrambleAttempts.slice(0, 5).map((play, i) => {
                const madeUp = play.scramble === "yes";
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
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                        <div className="flex items-center gap-1.5">
                          <CircleDot className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{play.scrambleClub || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>From {cap(play.girDirection)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Flag className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>{cap(play.scrambleShotType)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {madeUp ? (
                            <Check className="w-3.5 h-3.5 text-green-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-red-500" />
                          )}
                          <span className={madeUp ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                            U&D: {madeUp ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HoleInsightsContent;
