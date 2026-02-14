import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import { Share2, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);

  // Calculate stats
  const totalPar = holeStats.reduce((sum, h) => sum + (h.par || 0), 0);
  const scoreVsPar = totalScore - totalPar;
  const scoreVsParStr = scoreVsPar === 0 ? "E" : scoreVsPar > 0 ? `+${scoreVsPar}` : `${scoreVsPar}`;

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
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "trackd-round-summary.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // User cancelled share or error
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleClose = () => {
    onClose();
    navigate("/");
  };

  const stats = [
    { label: "FIR", value: firPct !== null ? `${firPct}%` : "—" },
    { label: "GIR", value: girPct !== null ? `${girPct}%` : "—" },
    { label: "Scramble", value: scramblePct !== null ? `${scramblePct}%` : "—" },
    { label: "Avg Putts", value: avgPutts ?? "—" },
  ];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        <DialogTitle className="sr-only">Round Summary</DialogTitle>

        {/* Shareable graphic card */}
        <div
          ref={cardRef}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(145deg, hsl(158 47% 18%), hsl(153 41% 30%), hsl(152 39% 41%))",
          }}
        >
          <div className="p-6 text-white">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={logoLight} alt="Trackd" className="h-8 object-contain" />
            </div>

            {/* Course & Date */}
            <div className="text-center mb-5">
              <h2 className="text-xl font-bold tracking-tight">{courseName}</h2>
              <p className="text-sm text-white/70 mt-1">{dateStr}</p>
            </div>

            {/* Score */}
            <div className="text-center mb-6">
              <div className="text-6xl font-extrabold tracking-tight">{totalScore}</div>
              <div className="text-lg font-semibold text-white/80 mt-1">{scoreVsParStr}</div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-2">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"
                >
                  <div className="text-lg font-bold">{s.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-white/70 mt-0.5">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons below the card */}
        <div className="flex gap-3 mt-4 px-2">
          <Button
            variant="outline"
            className="flex-1 bg-card border-border text-foreground"
            onClick={handleClose}
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
          <Button
            className="flex-1"
            onClick={handleShare}
            disabled={isSharing}
          >
            <Share2 className="w-4 h-4 mr-2" />
            {isSharing ? "Sharing..." : "Share"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RoundSummaryModal;
