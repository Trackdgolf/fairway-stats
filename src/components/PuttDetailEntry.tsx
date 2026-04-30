import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type PuttDistanceBucket = '0-3' | '4-8' | '9-14' | '15+';
export type PuttOutcome = 'holed' | 'short' | 'long' | 'left' | 'right' | 'lipped_out';

export interface PuttDetail {
  distance: PuttDistanceBucket | null;
  outcome: PuttOutcome | null;
}

const DISTANCE_BUCKETS: { value: PuttDistanceBucket; label: string }[] = [
  { value: '0-3', label: "0–3" },
  { value: '4-8', label: "4–8" },
  { value: '9-14', label: "9–14" },
  { value: '15+', label: "15+" },
];

const OUTCOMES: { value: PuttOutcome; label: string }[] = [
  { value: 'holed', label: "Holed" },
  { value: 'short', label: "Short" },
  { value: 'long', label: "Long" },
  { value: 'left', label: "Left" },
  { value: 'right', label: "Right" },
  { value: 'lipped_out', label: "Lip Out" },
];

interface PuttDetailEntryProps {
  putts: number;
  details: PuttDetail[];
  onChange: (details: PuttDetail[]) => void;
}

const PuttDetailEntry = ({ putts, details, onChange }: PuttDetailEntryProps) => {
  // Keep details length in sync with putt count
  useEffect(() => {
    if (details.length === putts) return;
    if (details.length < putts) {
      const additions = Array.from({ length: putts - details.length }, () => ({
        distance: null as PuttDistanceBucket | null,
        outcome: null as PuttOutcome | null,
      }));
      onChange([...details, ...additions]);
    } else {
      onChange(details.slice(0, putts));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [putts]);

  const updateDetail = (idx: number, patch: Partial<PuttDetail>) => {
    const next = details.map((d, i) => (i === idx ? { ...d, ...patch } : d));
    onChange(next);
  };

  if (putts <= 0) return null;

  return (
    <div className="mt-3 space-y-3 p-3 rounded-xl bg-muted/40 dark:bg-[hsl(var(--round-input))]/40 border border-border dark:border-[hsl(var(--round-border))]">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        Per-putt detail
      </p>
      {Array.from({ length: putts }).map((_, idx) => {
        const detail = details[idx] ?? { distance: null, outcome: null };
        return (
          <div key={idx} className="space-y-2">
            <p className="text-xs font-medium text-foreground">Putt {idx + 1}</p>

            <div className="flex gap-1.5">
              {DISTANCE_BUCKETS.map((b) => (
                <button
                  key={b.value}
                  type="button"
                  onClick={() => updateDetail(idx, { distance: b.value })}
                  className={cn(
                    "flex-1 h-8 rounded-lg text-xs font-medium transition-all",
                    detail.distance === b.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background dark:bg-[hsl(var(--round-input))] text-muted-foreground border border-border dark:border-[hsl(var(--round-border))]"
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {OUTCOMES.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => updateDetail(idx, { outcome: o.value })}
                  className={cn(
                    "h-8 rounded-lg text-xs font-medium transition-all",
                    detail.outcome === o.value
                      ? o.value === 'holed'
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground border-2 border-primary"
                      : "bg-background dark:bg-[hsl(var(--round-input))] text-muted-foreground border border-border dark:border-[hsl(var(--round-border))]"
                  )}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PuttDetailEntry;
