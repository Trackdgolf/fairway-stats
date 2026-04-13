import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { Club } from "@/hooks/useUserPreferences";

interface SortableClubCardProps {
  club: Club;
  onEdit: (club: Club) => void;
}

const SortableClubCard = ({ club, onEdit }: SortableClubCardProps) => {
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
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 right-1 p-1 text-muted-foreground/50 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div onClick={() => onEdit(club)} className="cursor-pointer">
        <p className="font-semibold text-foreground truncate pr-5">{club.name}</p>
      </div>
    </div>
  );
};

export default SortableClubCard;
