import { useState } from "react";
import { Club, StockYardages, ClubYardage } from "@/hooks/useUserPreferences";
import { Input } from "@/components/ui/input";
import { Ruler } from "lucide-react";

interface ClubDistancesProps {
  clubs: Club[];
  stockYardages: StockYardages;
  onUpdateYardage: (clubId: string, field: keyof ClubYardage, value: number | null) => void;
}

const ClubDistances = ({ clubs, stockYardages, onUpdateYardage }: ClubDistancesProps) => {
  const [editingCell, setEditingCell] = useState<{ clubId: string; field: keyof ClubYardage } | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (clubId: string, field: keyof ClubYardage) => {
    setEditingCell({ clubId, field });
    setEditValue(stockYardages[clubId]?.[field]?.toString() || "");
  };

  const handleSave = () => {
    if (!editingCell) return;
    const parsed = parseInt(editValue, 10);
    onUpdateYardage(editingCell.clubId, editingCell.field, isNaN(parsed) || parsed <= 0 ? null : parsed);
    setEditingCell(null);
  };

  const hasAnyYardages = Object.keys(stockYardages).length > 0;

  const fields: { key: keyof ClubYardage; label: string }[] = [
    { key: "low", label: "Low" },
    { key: "avg", label: "Avg" },
    { key: "high", label: "High" },
  ];

  return (
    <div className="space-y-3">
      {!hasAnyYardages && (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Ruler className="w-6 h-6 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-1">No stock yardages set yet</p>
          <p className="text-xs text-muted-foreground">Tap a value to add your distances</p>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center px-3 text-xs font-medium text-muted-foreground">
        <span className="flex-1">Club</span>
        {fields.map((f) => (
          <span key={f.key} className="w-16 text-center">{f.label}</span>
        ))}
      </div>

      <div className="space-y-1.5">
        {clubs.map((club) => {
          const yardage = stockYardages[club.id] || {};

          return (
            <div
              key={club.id}
              className="flex items-center p-3 rounded-lg border bg-card"
            >
              <span className="flex-1 font-medium text-foreground text-sm">{club.name}</span>
              {fields.map((f) => {
                const isEditing = editingCell?.clubId === club.id && editingCell?.field === f.key;
                const val = yardage[f.key];

                return isEditing ? (
                  <Input
                    key={f.key}
                    type="number"
                    inputMode="numeric"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={(e) => e.key === "Enter" && handleSave()}
                    className="w-16 h-7 text-center text-xs px-1"
                    placeholder="yds"
                    autoFocus
                  />
                ) : (
                  <span
                    key={f.key}
                    className={`w-16 text-center text-xs cursor-pointer rounded px-1 py-1 hover:bg-accent/50 transition-colors ${
                      val ? "font-semibold text-foreground" : "text-muted-foreground"
                    }`}
                    onClick={() => handleStartEdit(club.id, f.key)}
                  >
                    {val || "—"}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClubDistances;
