import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { Share2, X, MapPin, Flag, Circle, Grip, Download, Instagram } from "lucide-react";
import { canShareToInstagram, shareToInstagramStory } from "@/lib/instagramShare";
import { useTrackdHandicap } from "@/hooks/useTrackdHandicap";
import { Button } from "@/components/ui/button";
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
}

const RoundSummaryModal = ({
  open,
  onClose,
  courseName,
  totalScore,
  holeStats,
  playedAt,
}: RoundSummaryModalProps) => {
  const lightCardRef = useRef<HTMLDivElement>(null);
  const darkCardRef = useRef<HTMLDivElement>(null);
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

  // Net score calculation
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

  const cardContent = (logo: string, textColor: string, subtextColor: string, statBg: string, statTextColor: string) => (
    <div className={`p-6 ${textColor}`}>
      <div className="flex justify-center mb-4">
        <img src={logo} alt="Trackd" className="h-[4.5rem] object-contain" />
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

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Round Summary</DialogTitle>

        <Carousel
          opts={{ align: "center", loop: true }}
          className="w-full"
          setApi={(api) => {
            api?.on("select", () => setActiveIndex(api.selectedScrollSnap()));
          }}
        >
          <CarouselContent>
            {/* Light theme card */}
            <CarouselItem>
              <div
                ref={lightCardRef}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, hsl(158 47% 18%), hsl(153 41% 30%), hsl(152 39% 41%))",
                }}
              >
                {cardContent(logoLight, "text-white", "text-white/70", "bg-white/15", "text-white")}
              </div>
            </CarouselItem>

            {/* Dark theme card */}
            <CarouselItem>
              <div
                ref={darkCardRef}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "linear-gradient(145deg, hsl(222 47% 11%), hsl(217 33% 17%), hsl(217 19% 27%))",
                }}
              >
                {cardContent(logoDark, "text-[hsl(210_40%_96%)]", "text-[hsl(215_16%_65%)]", "bg-[hsl(217_19%_27%)]", "text-[hsl(152_44%_52%)]")}
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                activeIndex === i ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3 px-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-card border-border text-foreground"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-1" />
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-card border-border text-foreground"
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
              className="flex-1 bg-card border-border text-foreground"
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
