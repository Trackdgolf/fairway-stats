import greenImage from "@/assets/green-dispersion.png";
import type { HolePlay } from "@/hooks/useHoleHistory";

interface ScrambleOutcomeDispersionProps {
  history: HolePlay[];
}

const getColor = (pct: number) => {
  if (pct >= 60) return "text-green-400";
  if (pct >= 40) return "text-yellow-300";
  if (pct >= 20) return "text-orange-400";
  return "text-red-400";
};

interface StatGroup {
  saves: number;
  attempts: number;
}

const DispersionLabel = ({ pct, label }: { pct: number; label: string }) => (
  <div className="bg-black/75 rounded px-2 py-1.5 text-center min-w-[48px]">
    <div className={`font-bold text-xs ${getColor(pct)}`}>{Math.round(pct)}%</div>
    <div className="text-white/80 text-[7px] font-medium uppercase">{label}</div>
  </div>
);

const ScrambleOutcomeDispersion = ({ history }: ScrambleOutcomeDispersionProps) => {
  const groups: Record<string, StatGroup> = {};

  // Only attempts: GIR missed AND scramble logged as yes/no
  const attempts = history.filter(
    (p) => p.gir === false && (p.scramble === "yes" || p.scramble === "no")
  );

  attempts.forEach((p) => {
    const dir = p.girDirection;
    if (!dir || !["left", "right", "short", "long"].includes(dir)) return;
    if (!groups[dir]) groups[dir] = { saves: 0, attempts: 0 };
    groups[dir].attempts += 1;
    if (p.scramble === "yes") groups[dir].saves += 1;
  });

  const getPct = (key: string) =>
    groups[key] ? (groups[key].saves / groups[key].attempts) * 100 : null;

  const hasAny = Object.keys(groups).length > 0;

  if (!hasAny) {
    return (
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Up & Down % by Miss</h2>
        <div className="text-center text-sm text-muted-foreground py-8">
          No scramble attempts recorded for this hole yet.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Up & Down % by Miss</h2>
      <div className="max-w-[75%] mx-auto relative w-full">
        <img
          src={greenImage}
          alt="Scramble dispersion"
          className="w-full h-auto rounded-lg"
        />

        {/* LONG */}
        {groups.long && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
            <DispersionLabel pct={getPct("long")!} label="U&D" />
          </div>
        )}

        {/* LEFT */}
        {groups.left && (
          <div className="absolute top-[55%] left-4 transform -translate-y-1/2">
            <DispersionLabel pct={getPct("left")!} label="U&D" />
          </div>
        )}

        {/* RIGHT */}
        {groups.right && (
          <div className="absolute top-[55%] right-4 transform -translate-y-1/2">
            <DispersionLabel pct={getPct("right")!} label="U&D" />
          </div>
        )}

        {/* SHORT */}
        {groups.short && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
            <DispersionLabel pct={getPct("short")!} label="U&D" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ScrambleOutcomeDispersion;
