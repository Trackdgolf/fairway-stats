import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HolePerformance } from "@/hooks/useCoursePerformance";
import { useHoleHistory } from "@/hooks/useHoleHistory";
import HoleInsightsContent from "@/components/HoleInsightsContent";

interface HoleDetailProps {
  courseId: string;
  hole: HolePerformance;
  allHoles?: HolePerformance[];
  onNavigate?: (holeNumber: number) => void;
  onBack: () => void;
}

const HoleDetail = ({ courseId, hole, allHoles, onNavigate, onBack }: HoleDetailProps) => {
  const { data: history } = useHoleHistory(courseId, hole.holeNumber);

  // Get yardage from most recent play
  const yardage = history?.find((h) => h.yardage != null)?.yardage;

  // Prev/next hole navigation (sorted by hole number)
  const sortedHoles = (allHoles || []).slice().sort((a, b) => a.holeNumber - b.holeNumber);
  const currentIdx = sortedHoles.findIndex((h) => h.holeNumber === hole.holeNumber);
  const prevHole = currentIdx > 0 ? sortedHoles[currentIdx - 1] : null;
  const nextHole = currentIdx >= 0 && currentIdx < sortedHoles.length - 1 ? sortedHoles[currentIdx + 1] : null;
  const canNavigate = !!onNavigate && sortedHoles.length > 0;

  return (
    <div className="space-y-4 pt-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack} className="text-foreground shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground">Hole {hole.holeNumber}</h1>
          <p className="text-sm text-muted-foreground">
            Par {hole.par}
            {yardage ? ` · ${yardage} yards` : ""}
          </p>
        </div>
        {canNavigate && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => prevHole && onNavigate!(prevHole.holeNumber)}
              disabled={!prevHole}
              aria-label="Previous hole"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => nextHole && onNavigate!(nextHole.holeNumber)}
              disabled={!nextHole}
              aria-label="Next hole"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      <HoleInsightsContent
        courseId={courseId}
        holeNumber={hole.holeNumber}
        par={hole.par}
        avgScore={hole.avgScore}
        avgOverPar={hole.avgOverPar}
        personalStrokeIndex={hole.personalStrokeIndex}
      />
    </div>
  );
};

export default HoleDetail;
