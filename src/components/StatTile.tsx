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
        "p-6 transition-all relative",
        isSelectable && "cursor-pointer",
        isSelectable && isSelected && "border-[3px] border-primary"
      )}
    >
      {isSelectable && isSelected && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full" />
      )}
      <div className="flex flex-col items-center text-center">
        <div
          className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-4", iconColor)}
        >
          <Icon className={cn("w-8 h-8", iconTextColor)} />
        </div>
        <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
};

export default StatTile;
