import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { PuttingStats, PuttBucketStats } from "@/hooks/usePuttingStats";

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

const OutcomeBar = ({ b }: { b: PuttBucketStats }) => {
  if (b.total === 0) {
    return (
      <div className="h-2 rounded-full bg-muted" />
    );
  }
  const pct = (n: number) => (n / b.total) * 100;
  return (
    <div className="flex h-2 rounded-full overflow-hidden bg-muted">
      {b.holed > 0 && <div style={{ width: `${pct(b.holed)}%` }} className="bg-primary" title={`Holed ${b.holed}`} />}
      {b.lippedOut > 0 && <div style={{ width: `${pct(b.lippedOut)}%` }} className="bg-yellow-500" title={`Lip out ${b.lippedOut}`} />}
      {b.short > 0 && <div style={{ width: `${pct(b.short)}%` }} className="bg-muted-foreground/60" title={`Short ${b.short}`} />}
      {b.long > 0 && <div style={{ width: `${pct(b.long)}%` }} className="bg-muted-foreground/50" title={`Long ${b.long}`} />}
      {b.left > 0 && <div style={{ width: `${pct(b.left)}%` }} className="bg-muted-foreground/40" title={`Left ${b.left}`} />}
      {b.right > 0 && <div style={{ width: `${pct(b.right)}%` }} className="bg-muted-foreground/30" title={`Right ${b.right}`} />}
    </div>
  );
};

const PuttingPerformance = ({ stats, isLoading }: PuttingPerformanceProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Putting green graphic placeholder */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="aspect-[4/3] w-full rounded-xl bg-gradient-to-b from-primary/10 to-primary/5 border border-dashed border-primary/30 flex items-center justify-center">
            <p className="text-xs text-muted-foreground">Putting green graphic — coming soon</p>
          </div>
        </CardContent>
      </Card>

      {!stats || stats.total === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            No per-putt detail recorded yet.
            <br />
            Tap “Track each putt” next to the Putts stepper while entering a round to start logging.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {stats.buckets.map((b) => (
            <Card key={b.bucket}>
              <CardContent className="p-4 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {BUCKET_LABELS[b.bucket]}
                  </span>
                  <span className="text-xs text-muted-foreground">{b.total} attempt{b.total === 1 ? '' : 's'}</span>
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PuttingPerformance;
