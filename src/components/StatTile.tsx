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
        "p-3 transition-all relative flex items-center justify-center",
        isSelectable && "cursor-pointer",
        isSelectable && isSelected && "border-[3px] border-primary"
      )}
    >
      {isSelectable && isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
      )}
      <div className="flex flex-col items-center text-center py-2">
        <div
          className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-2", iconColor)}
        >
          <Icon className={cn("w-5 h-5", iconTextColor)} />
        </div>
        <p className="text-xl font-bold text-foreground mb-0.5">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
};

export default StatTile;
