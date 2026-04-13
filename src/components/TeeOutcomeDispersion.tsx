import { Card, CardContent } from "@/components/ui/card";
import type { HolePlay } from "@/hooks/useHoleHistory";

interface TeeOutcomeDispersionProps {
  history: HolePlay[];
  par: number;
}

interface OutcomeStat {
  label: string;
  avgOverPar: number;
  count: number;
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
  if (val < 0) return "text-green-500";
  if (val === 0) return "text-yellow-500";
  if (val <= 0.5) return "text-orange-400";
  return "text-red-500";
};

const getBgColor = (val: number) => {
  if (val < 0) return "bg-green-500/15 border-green-500/30";
  if (val === 0) return "bg-yellow-500/15 border-yellow-500/30";
  if (val <= 0.5) return "bg-orange-400/15 border-orange-400/30";
  return "bg-red-500/15 border-red-500/30";
};

const TeeOutcomeDispersion = ({ history, par }: TeeOutcomeDispersionProps) => {
  // Group plays by tee shot outcome
  const groups: Record<string, { totalOverPar: number; count: number }> = {};

  history.forEach((play) => {
    const key = getDirectionKey(play.fir, play.firDirection);
    if (!key) return;
    if (!groups[key]) groups[key] = { totalOverPar: 0, count: 0 };
    groups[key].totalOverPar += play.score - play.par;
    groups[key].count += 1;
  });

  const hitLabel = par === 3 ? "Green Hit" : "FW Hit";

  const directionConfig: { key: string; label: string }[] = [
    { key: "hit", label: hitLabel },
    { key: "left", label: "Left" },
    { key: "right", label: "Right" },
    { key: "short", label: "Short" },
    { key: "long", label: "Long" },
    { key: "penalty", label: "Penalty" },
  ];

  const stats: OutcomeStat[] = directionConfig
    .filter((d) => groups[d.key])
    .map((d) => ({
      label: d.label,
      avgOverPar: Math.round((groups[d.key].totalOverPar / groups[d.key].count) * 10) / 10,
      count: groups[d.key].count,
    }));

  if (stats.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3">Avg Score by Tee Shot</h2>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`rounded-lg border p-3 text-center ${getBgColor(stat.avgOverPar)}`}
              >
                <p className={`text-lg font-bold ${getColor(stat.avgOverPar)}`}>
                  {formatAvg(stat.avgOverPar)}
                </p>
                <p className="text-[10px] font-medium text-muted-foreground uppercase mt-0.5">
                  {stat.label}
                </p>
                <p className="text-[9px] text-muted-foreground/70 mt-0.5">
                  {stat.count} {stat.count === 1 ? "round" : "rounds"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeeOutcomeDispersion;
