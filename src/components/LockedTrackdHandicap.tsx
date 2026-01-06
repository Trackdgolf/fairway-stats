import { Lock, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface LockedTrackdHandicapProps {
  onUpgrade: () => void;
}

export const LockedTrackdHandicap = ({ onUpgrade }: LockedTrackdHandicapProps) => {
  return (
    <Card 
      onClick={onUpgrade}
      className="cursor-pointer hover:bg-accent/50 transition-colors"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">Trackd Hdcp</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Premium
            </Badge>
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-muted-foreground/50 blur-[3px] select-none">
            --.-
          </span>
        </div>
        <p className="text-xs text-primary mt-2">Tap to upgrade and view your handicap</p>
      </CardContent>
    </Card>
  );
};
