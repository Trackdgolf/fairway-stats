import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Club, ClubYardage } from "@/hooks/useUserPreferences";

interface SortableClubCardProps {
  club: Club;
  yardage: ClubYardage | undefined;
  onEdit: (club: Club) => void;
  onYardageChange: (clubId: string, field: keyof ClubYardage, value: number | null) => void;
}

const SortableClubCard = ({ club, yardage, onEdit, onYardageChange }: SortableClubCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: club.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 rounded-lg border bg-background hover:bg-accent transition-colors relative"
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 p-1 text-muted-foreground/50 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Club name - tappable to edit */}
      <div onClick={() => onEdit(club)} className="cursor-pointer">
        <p className="font-semibold text-foreground truncate pr-5">{club.name}</p>
      </div>

      {/* Yardage inputs */}
      <div className="flex items-center gap-1 mt-1">
        {(["low", "avg", "high"] as const).map((field) => (
          <Input
            key={field}
            type="number"
            inputMode="numeric"
            value={yardage?.[field] || ""}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              onYardageChange(club.id, field, isNaN(val) || val <= 0 ? null : val);
            }}
            placeholder={field}
            className="w-12 h-6 text-xs text-center px-0.5"
          />
        ))}
      </div>
    </div>
  );
};

export default SortableClubCard;
