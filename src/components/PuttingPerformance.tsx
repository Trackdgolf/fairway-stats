import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PuttingStats, PuttBucketStats, PuttDistanceBucket } from "@/hooks/usePuttingStats";

interface PuttingPerformanceProps {
  stats: PuttingStats | undefined;
  isLoading: boolean;
}

const BUCKET_LABELS: Record<string, string> = {
  '0-3': '0–3 ft',
  '4-8': '4–8 ft',
  '9-14': '9–14 ft',
  '15+': '15 ft +',
};

type OutcomeKey = 'holed' | 'lippedOut' | 'short' | 'long' | 'left' | 'right';

const OUTCOMES: { key: OutcomeKey; label: string; barClass: string }[] = [
  { key: 'holed', label: 'Holed', barClass: 'bg-primary' },
  { key: 'lippedOut', label: 'Lip out', barClass: 'bg-yellow-500' },
  { key: 'short', label: 'Short', barClass: 'bg-muted-foreground/60' },
  { key: 'long', label: 'Long', barClass: 'bg-muted-foreground/50' },
  { key: 'left', label: 'Left', barClass: 'bg-muted-foreground/40' },
  { key: 'right', label: 'Right', barClass: 'bg-muted-foreground/30' },
];

const OutcomeBar = ({ b }: { b: PuttBucketStats }) => {
  if (b.total === 0) {
    return <div className="h-2 rounded-full bg-muted" />;
  }
  const pct = (n: number) => (n / b.total) * 100;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
      {b.holed > 0 && <div style={{ width: `${pct(b.holed)}%` }} className="bg-primary" />}
      {b.lippedOut > 0 && <div style={{ width: `${pct(b.lippedOut)}%` }} className="bg-yellow-500" />}
      {b.short > 0 && <div style={{ width: `${pct(b.short)}%` }} className="bg-muted-foreground/60" />}
      {b.long > 0 && <div style={{ width: `${pct(b.long)}%` }} className="bg-muted-foreground/50" />}
      {b.left > 0 && <div style={{ width: `${pct(b.left)}%` }} className="bg-muted-foreground/40" />}
      {b.right > 0 && <div style={{ width: `${pct(b.right)}%` }} className="bg-muted-foreground/30" />}
    </div>
  );
};

const aggregateAll = (buckets: PuttBucketStats[]): PuttBucketStats => {
  return buckets.reduce<PuttBucketStats>(
    (acc, b) => ({
      bucket: '0-3',
      total: acc.total + b.total,
      holed: acc.holed + b.holed,
      short: acc.short + b.short,
      long: acc.long + b.long,
      left: acc.left + b.left,
      right: acc.right + b.right,
      lippedOut: acc.lippedOut + b.lippedOut,
      makePercent: 0,
    }),
    { bucket: '0-3', total: 0, holed: 0, short: 0, long: 0, left: 0, right: 0, lippedOut: 0, makePercent: 0 },
  );
};

const OutcomeBreakdown = ({ scope }: { scope: PuttBucketStats }) => {
  if (scope.total === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-8">
        No putts recorded in this range yet.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {OUTCOMES.map((o) => {
        const count = scope[o.key] as number;
        const pct = Math.round((count / scope.total) * 100);
        return (
          <div key={o.key} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-14 shrink-0">{o.label}</span>
            <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-300", o.barClass)}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-foreground w-10 text-right tabular-nums">
              {pct}%
            </span>
          </div>
        );
      })}
    </div>
  );
};

const PuttingPerformance = ({ stats, isLoading }: PuttingPerformanceProps) => {
  const [selectedBucket, setSelectedBucket] = useState<PuttDistanceBucket | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasData = stats && stats.total > 0;
  const scope: PuttBucketStats | null = hasData
    ? selectedBucket
      ? stats.buckets.find((b) => b.bucket === selectedBucket) ?? aggregateAll(stats.buckets)
      : aggregateAll(stats.buckets)
    : null;

  const scopeLabel = selectedBucket ? BUCKET_LABELS[selectedBucket] : 'All putts';

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold text-foreground">Outcome breakdown</h3>
            <span className="text-xs text-muted-foreground">
              {scopeLabel}
              {scope ? ` · ${scope.total} attempt${scope.total === 1 ? '' : 's'}` : ''}
            </span>
          </div>
          {scope ? (
            <OutcomeBreakdown scope={scope} />
          ) : (
            <p className="text-xs text-muted-foreground text-center py-8">
              No per-putt detail recorded yet.
            </p>
          )}
          {selectedBucket && (
            <button
              type="button"
              onClick={() => setSelectedBucket(null)}
              className="text-[11px] text-primary font-medium hover:underline"
            >
              ← Show all putts
            </button>
          )}
        </CardContent>
      </Card>

      {!hasData ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No per-putt detail recorded yet.
            <br />
            Tap "Track each putt" next to the Putts stepper while entering a round to start logging.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.buckets.map((b) => {
            const isActive = selectedBucket === b.bucket;
            return (
              <button
                key={b.bucket}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSelectedBucket((prev) => (prev === b.bucket ? null : b.bucket))}
                className={cn(
                  "text-left rounded-lg border bg-card text-card-foreground shadow-sm transition-all",
                  "hover:border-primary/40 active:scale-[0.99]",
                  isActive && "border-primary ring-2 ring-primary/40 bg-primary/5",
                )}
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {BUCKET_LABELS[b.bucket]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {b.total} attempt{b.total === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-foreground">
                    {b.total > 0 ? `${b.makePercent}%` : '—'}
                  </div>
                  <p className="text-[10px] text-muted-foreground -mt-1">Make rate</p>
                  <OutcomeBar b={b} />
                  {b.total > 0 && (() => {
                    const pctLabel = (n: number) => `${Math.round((n / b.total) * 100)}%`;
                    return (
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[10px] text-muted-foreground pt-1">
                        {b.holed > 0 && <span><span className="inline-block w-2 h-2 rounded-full bg-primary mr-1 align-middle" />Holed {pctLabel(b.holed)}</span>}
                        {b.short > 0 && <span>Short {pctLabel(b.short)}</span>}
                        {b.long > 0 && <span>Long {pctLabel(b.long)}</span>}
                        {b.left > 0 && <span>Left {pctLabel(b.left)}</span>}
                        {b.right > 0 && <span>Right {pctLabel(b.right)}</span>}
                        {b.lippedOut > 0 && <span><span className="inline-block w-2 h-2 rounded-full bg-yellow-500 mr-1 align-middle" />Lip {pctLabel(b.lippedOut)}</span>}
                      </div>
                    );
                  })()}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PuttingPerformance;
