import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { Share2, X, MapPin, Flag, Circle, Grip, Download, Instagram, CheckCircle2, Target } from "lucide-react";
import { canShareToInstagram, shareToInstagramStory } from "@/lib/instagramShare";
import { useTrackdHandicap } from "@/hooks/useTrackdHandicap";
import { buildUserStats } from "@/hooks/useAchievements";
import { CHALLENGE_DEFINITIONS } from "@/lib/challengeDefinitions";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";

interface HoleData {
  score: number | null;
  fir: boolean | null;
  gir: boolean | null;
  scramble: 'yes' | 'no' | 'n/a' | null;
  putts: number | null;
  par?: number | null;
}

interface RoundSummaryModalProps {
  open: boolean;
  onClose: () => void;
  courseName: string;
  totalScore: number;
  holeStats: HoleData[];
  playedAt?: string;
  roundId?: string;
}

type HoleStatRow = {
  round_id: string;
  hole_number: number;
  score: number | null;
  par: number | null;
  fir: boolean | null;
  gir: boolean | null;
  putts: number | null;
  scramble: string | null;
  scramble_shot_type: string | null;
  penalties: number | null;
  yardage?: number | null;
};

const ChallengesSection = ({ roundId }: { roundId?: string }) => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const { data: challengeData } = useQuery({
    queryKey: ["round-challenges", roundId, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch all rounds
      const { data: allRounds, error: roundsErr } = await supabase
        .from("rounds")
        .select("id, total_score, course_id, country")
        .eq("user_id", user.id);
      if (roundsErr) throw roundsErr;

      const allRoundIds = (allRounds || []).map(r => r.id);
      let allHoleStats: HoleStatRow[] = [];

      if (allRoundIds.length > 0) {
        for (let i = 0; i < allRoundIds.length; i += 100) {
          const chunk = allRoundIds.slice(i, i + 100);
          const { data, error } = await supabase
            .from("hole_stats")
            .select("round_id, hole_number, score, par, fir, gir, putts, scramble, scramble_shot_type, penalties, yardage")
            .in("round_id", chunk);
          if (error) throw error;
          if (data) allHoleStats = allHoleStats.concat(data as HoleStatRow[]);
        }
      }

      // Build stats WITH the current round (all data)
      const statsWithRound = buildUserStats(allRounds || [], allHoleStats);
      const challengesWithRound = CHALLENGE_DEFINITIONS.map(def => ({
        ...def,
        result: def.evaluate(statsWithRound),
      }));

      // Build stats WITHOUT the current round
      const roundsWithout = (allRounds || []).filter(r => r.id !== roundId);
      const holesWithout = allHoleStats.filter(h => h.round_id !== roundId);
      const statsWithoutRound = buildUserStats(roundsWithout, holesWithout);
      const challengesWithoutRound = CHALLENGE_DEFINITIONS.map(def => ({
        ...def,
        result: def.evaluate(statsWithoutRound),
      }));

      // Find newly completed challenges (completed WITH but not WITHOUT this round)
      const newlyCompleted = challengesWithRound
        .filter((c, i) => c.result.isCompleted && !challengesWithoutRound[i].result.isCompleted)
        .map(c => ({
          id: c.id,
          title: c.title,
          progress: c.result.progress,
          target: c.result.target,
          isCompleted: true,
        }));

      // In-progress fallback: sort by proximity to target
      const inProgress = challengesWithRound
        .filter(c => !c.result.isCompleted && c.result.target > 0)
        .sort((a, b) => (b.result.progress / b.result.target) - (a.result.progress / a.result.target))
        .slice(0, 3)
        .map(c => ({
          id: c.id,
          title: c.title,
          progress: c.result.progress,
          target: c.result.target,
          isCompleted: false,
        }));

      return { newlyCompleted, inProgress };
    },
    enabled: !!user?.id && !!roundId,
  });

  const newlyCompleted = challengeData?.newlyCompleted || [];
  const inProgress = challengeData?.inProgress || [];
  const displayChallenges = newlyCompleted.length > 0 ? newlyCompleted.slice(0, 5) : inProgress;
  const isCompletedSection = newlyCompleted.length > 0;

  if (displayChallenges.length === 0) return null;

  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {isCompletedSection ? "Challenges Completed" : "Challenges In Progress"}
      </p>
      <div className="space-y-2">
        {displayChallenges.map(challenge => (
          <div
            key={challenge.id}
            className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 shadow-sm"
          >
            {challenge.isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
            ) : (
              <Target className="w-5 h-5 text-orange-500 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{challenge.title}</p>
              {!challenge.isCompleted && (
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={(challenge.progress / challenge.target) * 100} className="h-1.5 flex-1" />
                  <span className="text-[10px] text-gray-400 shrink-0">
                    {challenge.progress}/{challenge.target}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Shareable Card Content ---
const ShareableCardContent = ({
  logo,
  textColor,
  subtextColor,
  statBg,
  statTextColor,
  courseName,
  dateStr,
  totalScore,
  scoreVsParStr,
  scoreVsParColor,
  netScoreVsParStr,
  netScoreVsParColor,
  stats,
}: {
  logo: string;
  textColor: string;
  subtextColor: string;
  statBg: string;
  statTextColor: string;
  courseName: string;
  dateStr: string;
  totalScore: number;
  scoreVsParStr: string;
  scoreVsParColor: string;
  netScoreVsParStr: string;
  netScoreVsParColor: string;
  stats: { label: string; value: string; icon: React.ElementType; color: string; iconColor: string }[];
}) => (
  <div className={`p-6 ${textColor}`}>
    <div className="flex justify-center mb-4">
      <img src={logo} alt="TRACKD" className="h-[4.5rem] object-contain" />
    </div>
    <div className="text-center mb-5">
      <h2 className="text-xl font-bold tracking-tight">{courseName}</h2>
      <p className={`text-sm ${subtextColor} mt-1`}>{dateStr}</p>
    </div>
    <div className="text-center mb-6">
      <div className="text-6xl font-extrabold tracking-tight">{totalScore}</div>
      <div className={`text-[10px] uppercase tracking-wider ${subtextColor}`} style={{ marginTop: '14px', marginBottom: '8px', lineHeight: '1', paddingTop: '4px' }}>Gross / Nett</div>
      <div className="flex items-center justify-center gap-1.5" style={{ marginTop: '4px' }}>
        <span className={`text-lg font-semibold ${scoreVsParColor}`}>{scoreVsParStr}</span>
        <span className={`text-lg font-semibold ${subtextColor}`}>/</span>
        <span className={`text-lg font-semibold ${netScoreVsParColor}`}>{netScoreVsParStr}</span>
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2">
      {stats.map((s) => (
        <div key={s.label} className={`${statBg} backdrop-blur-sm rounded-xl p-3 text-center`}>
          <div className={`w-8 h-8 rounded-full ${s.color} flex items-center justify-center mx-auto mb-1.5`}>
            <s.icon className={`w-4 h-4 ${s.iconColor}`} />
          </div>
          <div className={`text-lg font-bold ${statTextColor}`}>{s.value}</div>
          <div className={`text-[10px] uppercase tracking-wider ${subtextColor} mt-0.5`}>
            {s.label}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RoundSummaryModal = ({
  open,
  onClose,
  courseName,
  totalScore,
  holeStats,
  playedAt,
  roundId,
}: RoundSummaryModalProps) => {
  const lightCardRef = useRef<HTMLDivElement>(null);
  const darkCardRef = useRef<HTMLDivElement>(null);
  const scorecardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [instagramAvailable, setInstagramAvailable] = useState(false);
  const { handicap } = useTrackdHandicap();

  useEffect(() => {
    canShareToInstagram().then(setInstagramAvailable);
  }, []);

  // Calculate stats
  const totalPar = holeStats.reduce((sum, h) => sum + (h.par || 0), 0);
  const scoreVsPar = totalScore - totalPar;
  const scoreVsParStr = scoreVsPar === 0 ? "E" : scoreVsPar > 0 ? `+${scoreVsPar}` : `${scoreVsPar}`;

  const netScoreVsPar = handicap !== null ? scoreVsPar - Math.round(handicap) : null;
  const netScoreVsParStr = netScoreVsPar !== null
    ? (netScoreVsPar === 0 ? "E" : netScoreVsPar > 0 ? `+${netScoreVsPar}` : `${netScoreVsPar}`)
    : "—";

  const getScoreVsParColor = (val: number) => {
    if (val <= 0) return "text-green-400";
    if (val <= 3) return "text-yellow-400";
    if (val <= 6) return "text-orange-400";
    if (val <= 10) return "text-orange-500";
    return "text-red-500";
  };
  const scoreVsParColor = getScoreVsParColor(scoreVsPar);
  const netScoreVsParColor = netScoreVsPar !== null ? getScoreVsParColor(netScoreVsPar) : "text-muted-foreground";

  const firHoles = holeStats.filter((h) => h.par !== 3 && h.fir !== null);
  const firPct = firHoles.length > 0
    ? Math.round((firHoles.filter((h) => h.fir).length / firHoles.length) * 100)
    : null;

  const girHoles = holeStats.filter((h) => h.gir !== null);
  const girPct = girHoles.length > 0
    ? Math.round((girHoles.filter((h) => h.gir).length / girHoles.length) * 100)
    : null;

  const scrambleHoles = holeStats.filter((h) => h.scramble === 'yes' || h.scramble === 'no');
  const scramblePct = scrambleHoles.length > 0
    ? Math.round((scrambleHoles.filter((h) => h.scramble === 'yes').length / scrambleHoles.length) * 100)
    : null;

  const puttHoles = holeStats.filter((h) => h.putts !== null);
  const avgPutts = puttHoles.length > 0
    ? (puttHoles.reduce((sum, h) => sum + (h.putts || 0), 0) / puttHoles.length).toFixed(1)
    : null;

  const dateStr = playedAt
    ? new Date(playedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const handleShare = async () => {
    const cardRef = activeIndex === 0 ? lightCardRef : darkCardRef;
    if (!cardRef.current) return;
    setIsSharing(true);

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );

      if (!blob) throw new Error("Failed to create image");

      const file = new File([blob], "trackd-round-summary.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `My Round at ${courseName}`,
          text: `Shot ${totalScore} (${scoreVsParStr}) at ${courseName} 🏌️`,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "trackd-round-summary.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleSaveImage = async () => {
    const cardRef = activeIndex === 0 ? lightCardRef : darkCardRef;
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "trackd-round-summary.png";
      a.click();
    } catch (err) {
      console.error("Save error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleInstagramShare = async () => {
    const cardRef = activeIndex === 0 ? lightCardRef : darkCardRef;
    if (!cardRef.current) return;
    setIsSharing(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      await shareToInstagramStory(canvas, handleShare);
    } catch (err) {
      console.error("Instagram share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    onClose();
    navigate("/");
  };

  const stats = [
    { label: "FIR", value: firPct !== null ? `${firPct}%` : "—", icon: MapPin, color: "bg-green-500/20", iconColor: "text-green-400" },
    { label: "GIR", value: girPct !== null ? `${girPct}%` : "—", icon: Flag, color: "bg-pink-500/20", iconColor: "text-pink-400" },
    { label: "Scramble", value: scramblePct !== null ? `${scramblePct}%` : "—", icon: Circle, color: "bg-orange-500/20", iconColor: "text-orange-400" },
    { label: "Avg Putts", value: avgPutts ?? "—", icon: Grip, color: "bg-purple-500/20", iconColor: "text-purple-400" },
  ];

  const cardProps = {
    courseName,
    dateStr,
    totalScore,
    scoreVsParStr,
    scoreVsParColor,
    netScoreVsParStr,
    netScoreVsParColor,
    stats,
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm p-0 border-none bg-[#ededed] shadow-none rounded-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogTitle className="sr-only">Round Report</DialogTitle>

        {/* Round Report Title */}
        <div className="pt-5 pb-2 text-center">
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">Round Report</h1>
        </div>

        {/* Challenges Section */}
        <ChallengesSection roundId={roundId} />

        {/* Shareable Graphic Carousel - scaled down */}
        <div className="px-6">
          <Carousel
            opts={{ align: "center", loop: true }}
            className="w-full"
            setApi={(api) => {
              api?.on("select", () => setActiveIndex(api.selectedScrollSnap()));
            }}
          >
            <CarouselContent>
              <CarouselItem>
                <div
                  ref={lightCardRef}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, hsl(158 47% 18%), hsl(153 41% 30%), hsl(152 39% 41%))",
                  }}
                >
                  <ShareableCardContent
                    logo={logoLight}
                    textColor="text-white"
                    subtextColor="text-white/70"
                    statBg="bg-white/15"
                    statTextColor="text-white"
                    {...cardProps}
                  />
                </div>
              </CarouselItem>

              <CarouselItem>
                <div
                  ref={darkCardRef}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: "linear-gradient(145deg, hsl(222 47% 11%), hsl(217 33% 17%), hsl(217 19% 27%))",
                  }}
                >
                  <ShareableCardContent
                    logo={logoDark}
                    textColor="text-[hsl(210_40%_96%)]"
                    subtextColor="text-[hsl(215_16%_65%)]"
                    statBg="bg-[hsl(217_19%_27%)]"
                    statTextColor="text-[hsl(152_44%_52%)]"
                    {...cardProps}
                  />
                </div>
              </CarouselItem>

              <CarouselItem>
                <div
                  ref={scorecardRef}
                  className="rounded-2xl overflow-hidden aspect-[9/16] flex flex-col text-white"
                  style={{
                    background: "linear-gradient(145deg, hsl(158 47% 18%), hsl(153 41% 30%), hsl(152 39% 41%))",
                  }}
                >
                  <ScorecardContent
                    courseName={courseName}
                    dateStr={dateStr}
                    holeStats={holeStats}
                    totalScore={totalScore}
                    totalPar={totalPar}
                    scoreVsParStr={scoreVsParStr}
                    scoreVsParColor={scoreVsParColor}
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-1">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeIndex === i ? "bg-gray-800" : "bg-gray-400/40"
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-1 px-4 pb-5">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white border-gray-300 text-gray-900"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-white border-gray-300 text-gray-900"
            onClick={handleSaveImage}
            disabled={isSharing}
          >
            <Download className="w-4 h-4 mr-1" />
            Save
          </Button>
          {instagramAvailable && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 bg-white border-gray-300 text-gray-900"
              onClick={handleInstagramShare}
              disabled={isSharing}
            >
              <Instagram className="w-4 h-4 mr-1" />
              Story
            </Button>
          )}
          <Button
            size="sm"
            className="flex-1"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoundSummaryModal;
