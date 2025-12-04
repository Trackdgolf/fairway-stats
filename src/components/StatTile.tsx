import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatTileProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  isSelected: boolean;
  onClick: () => void;
  iconColor: string;
  iconTextColor?: string;
  isSelectable?: boolean;
}

const StatTile = ({ 
  icon: Icon, 
  value, 
  label, 
  isSelected, 
  onClick, 
  iconColor, 
  iconTextColor = "text-primary",
  isSelectable = true 
}: StatTileProps) => {
  return (
    <Card
      onClick={isSelectable ? onClick : undefined}
      className={cn(
        "p-4 transition-all relative aspect-square flex items-center justify-center",
        isSelectable && "cursor-pointer",
        isSelectable && isSelected && "border-[3px] border-primary"
      )}
    >
      {isSelectable && isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
      )}
      <div className="flex flex-col items-center text-center">
        <div
          className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", iconColor)}
        >
          <Icon className={cn("w-6 h-6", iconTextColor)} />
        </div>
        <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
};

export default StatTile;
