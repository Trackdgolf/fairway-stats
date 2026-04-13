import fairwayImage from "@/assets/fairway-dispersion.png";
import greenImage from "@/assets/green-dispersion.png";
import type { HolePlay } from "@/hooks/useHoleHistory";

interface TeeOutcomeDispersionProps {
  history: HolePlay[];
  par: number;
}

const getDirectionKey = (fir: boolean | null, firDirection: string | null): string | null => {
  if (fir === null) return null;
  if (fir) return "hit";
  if (firDirection === "left") return "left";
  if (firDirection === "right") return "right";
  if (firDirection === "short") return "short";
  if (firDirection === "long") return "long";
  if (firDirection === "penalty") return "penalty";
  return null;
};

const formatAvg = (val: number) => {
  if (val === 0) return "E";
  return val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1);
};

const getColor = (val: number) => {
  if (val < 0) return "text-green-400";
  if (val === 0) return "text-yellow-300";
  if (val <= 0.5) return "text-orange-400";
  return "text-red-400";
};

interface StatGroup {
  totalOverPar: number;
  count: number;
}

const DispersionLabel = ({ avgOverPar, count, label }: { avgOverPar: number; count: number; label: string }) => (
  <div className="bg-black/75 rounded-lg px-3 py-2 text-center min-w-[64px]">
    <div className={`font-bold text-base ${getColor(avgOverPar)}`}>{formatAvg(avgOverPar)}</div>
    <div className="text-white/80 text-[9px] font-medium uppercase">{label}</div>
    <div className="text-white/50 text-[8px] mt-0.5">{count} {count === 1 ? "round" : "rounds"}</div>
  </div>
);

const TeeOutcomeDispersion = ({ history, par }: TeeOutcomeDispersionProps) => {
  const groups: Record<string, StatGroup> = {};

  history.forEach((play) => {
    const key = getDirectionKey(play.fir, play.firDirection);
    if (!key) return;
    if (!groups[key]) groups[key] = { totalOverPar: 0, count: 0 };
    groups[key].totalOverPar += play.score - play.par;
    groups[key].count += 1;
  });

  const getAvg = (key: string) =>
    groups[key] ? Math.round((groups[key].totalOverPar / groups[key].count) * 10) / 10 : null;

  const hasAny = Object.keys(groups).length > 0;
  if (!hasAny) return null;

  const isPar3 = par === 3;
  const hitLabel = isPar3 ? "ON GREEN" : "FW HIT";

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Avg Score by Tee Shot</h2>
      <div className="max-w-[75%] mx-auto relative w-full">
        <img
          src={isPar3 ? greenImage : fairwayImage}
          alt="Tee shot dispersion"
          className="w-full h-auto rounded-lg"
        />

        {/* HIT - Center */}
        {groups.hit && (
          <div className={`absolute ${isPar3 ? "top-[42%]" : "top-[40%]"} left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
            <DispersionLabel avgOverPar={getAvg("hit")!} count={groups.hit.count} label={hitLabel} />
          </div>
        )}

        {/* LONG - Top (par 3 only) */}
        {isPar3 && groups.long && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <DispersionLabel avgOverPar={getAvg("long")!} count={groups.long.count} label="LONG" />
          </div>
        )}

        {/* LEFT */}
        {groups.left && (
          <div className="absolute top-[55%] left-4 transform -translate-y-1/2">
            <DispersionLabel avgOverPar={getAvg("left")!} count={groups.left.count} label="LEFT" />
          </div>
        )}

        {/* RIGHT */}
        {groups.right && (
          <div className="absolute top-[55%] right-4 transform -translate-y-1/2">
            <DispersionLabel avgOverPar={getAvg("right")!} count={groups.right.count} label="RIGHT" />
          </div>
        )}

        {/* SHORT */}
        {groups.short && (
          <div className={`absolute ${isPar3 ? "bottom-6" : "bottom-[22%]"} left-1/2 transform -translate-x-1/2`}>
            <DispersionLabel avgOverPar={getAvg("short")!} count={groups.short.count} label="SHORT" />
          </div>
        )}

        {/* PENALTY (fairway only) */}
        {!isPar3 && groups.penalty && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <DispersionLabel avgOverPar={getAvg("penalty")!} count={groups.penalty.count} label="PENALTY" />
          </div>
        )}
      </div>
    </div>
  );
};

export default TeeOutcomeDispersion;
