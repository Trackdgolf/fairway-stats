import { useTrackdHandicap } from '@/hooks/useTrackdHandicap';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const TrackdHandicap = () => {
  const { handicap, roundsUsed, totalRounds, isLoading } = useTrackdHandicap();

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6 text-center">
          <Skeleton className="h-4 w-24 mx-auto mb-3" />
          <Skeleton className="h-12 w-16 mx-auto mb-2" />
          <Skeleton className="h-3 w-32 mx-auto" />
        </CardContent>
      </Card>
    );
  }

  const hasEnoughRounds = totalRounds >= 3;

  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6 text-center">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
          Trackd Hdcp
        </h3>
        
        {hasEnoughRounds && handicap !== null ? (
          <>
            <div className="text-4xl font-bold text-primary">
              {handicap < 0 ? '+' : ''}{handicap < 0 ? Math.abs(handicap) : handicap}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Best {roundsUsed} of {totalRounds >= 20 ? '20' : totalRounds} rounds
            </p>
          </>
        ) : (
          <>
            <div className="text-4xl font-bold text-muted-foreground">
              --
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Play {3 - totalRounds} more round{3 - totalRounds !== 1 ? 's' : ''} to calculate
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
