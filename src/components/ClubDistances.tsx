import { useState } from "react";
import { Club, StockYardages } from "@/hooks/useUserPreferences";
import { Input } from "@/components/ui/input";
import { Ruler } from "lucide-react";

interface ClubDistancesProps {
  clubs: Club[];
  stockYardages: StockYardages;
  onUpdateYardage: (clubId: string, yardage: number | null) => void;
}

const ClubDistances = ({ clubs, stockYardages, onUpdateYardage }: ClubDistancesProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (club: Club) => {
    setEditingId(club.id);
    setEditValue(stockYardages[club.id]?.toString() || "");
  };

  const handleSave = (clubId: string) => {
    const parsed = parseInt(editValue, 10);
    onUpdateYardage(clubId, isNaN(parsed) || parsed <= 0 ? null : parsed);
    setEditingId(null);
  };

  const hasAnyYardages = Object.keys(stockYardages).length > 0;

  return (
    <div className="space-y-3">
      {!hasAnyYardages && (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No stock yardages set yet</p>
          <p className="text-xs text-muted-foreground">Tap a club below to add your distance</p>
        </div>
      )}

      <div className="space-y-2">
        {clubs.map((club) => {
          const yardage = stockYardages[club.id];
          const isEditing = editingId === club.id;

          return (
            <div
              key={club.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => !isEditing && handleStartEdit(club)}
            >
              <span className="font-medium text-foreground">{club.name}</span>
              {isEditing ? (
                <Input
                  type="number"
                  inputMode="numeric"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSave(club.id)}
                  onKeyDown={(e) => e.key === "Enter" && handleSave(club.id)}
                  className="w-20 h-8 text-right text-sm"
                  placeholder="yds"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={`text-sm ${yardage ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                  {yardage ? `${yardage} yds` : "— yds"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClubDistances;
