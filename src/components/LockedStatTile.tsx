import { Lock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LockedStatTileProps {
  label: string;
  icon: React.ReactNode;
  iconColor?: string;
  onClick: () => void;
}

export const LockedStatTile = ({ label, icon, iconColor, onClick }: LockedStatTileProps) => {
  return (
    <Card 
      onClick={onClick}
      className="cursor-pointer hover:bg-accent/50 transition-colors relative overflow-hidden"
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className={cn("p-2 rounded-lg bg-muted", iconColor)}>
            {icon}
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-muted-foreground" />
            <Badge variant="secondary" className="text-xs px-1.5 py-0">
              Premium
            </Badge>
          </div>
        </div>
        <p className="text-2xl font-bold text-muted-foreground/50 blur-[2px] select-none">
          --
        </p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-primary mt-1">Tap to upgrade</p>
      </CardContent>
    </Card>
  );
};
