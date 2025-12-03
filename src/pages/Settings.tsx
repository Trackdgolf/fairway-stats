import { ArrowLeft, Plus, Trash2, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStatPreferences, StatPreferences } from "@/hooks/useStatPreferences";
import { useMyBag, Club } from "@/hooks/useMyBag";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Settings = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference } = useStatPreferences();
  const { clubs, renameClub, addClub, removeClub, resetToDefault } = useMyBag();
  const [newClubName, setNewClubName] = useState("");
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [editName, setEditName] = useState("");

  const statOptions: { key: keyof StatPreferences; label: string; description: string }[] = [
    { key: "fir", label: "FIR (Fairway in Regulation)", description: "Track fairway accuracy on tee shots" },
    { key: "gir", label: "GIR (Green in Regulation)", description: "Track greens hit in regulation" },
    { key: "scramble", label: "Scramble %", description: "Track scramble success when missing GIR" },
    { key: "putts", label: "Putts", description: "Track putts per hole" },
    { key: "teeClub", label: "Tee Club", description: "Track which club used off the tee" },
    { key: "approachClub", label: "Approach Club", description: "Track which club used for approach shots" },
  ];

  const handleAddClub = () => {
    if (newClubName.trim()) {
      addClub(newClubName.trim());
      setNewClubName("");
    }
  };

  const openEditDialog = (club: Club) => {
    setEditingClub(club);
    setEditName(club.name);
  };

  const handleSaveEdit = () => {
    if (editingClub && editName.trim()) {
      renameClub(editingClub.id, editName.trim());
      setEditingClub(null);
    }
  };

  const handleDeleteClub = () => {
    if (editingClub) {
      removeClub(editingClub.id);
      setEditingClub(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20 relative">
      <PageHeader />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-header-foreground hover:text-header-foreground/70 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-header-foreground">Settings</h1>
        </div>

        {/* Appearance Section */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Theme</p>
              <p className="text-sm text-muted-foreground">Toggle light/dark mode</p>
            </div>
            <ThemeToggle />
          </div>
        </Card>

        {/* My Bag Section - Collapsible */}
        <Accordion type="single" collapsible className="mb-6">
          <AccordionItem value="my-bag" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">My Bag</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Customize the clubs in your bag
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="pb-4">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetToDefault}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="w-4 h-4 mr-1" />
                    Reset
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {clubs.map((club) => (
                    <div
                      key={club.id}
                      onClick={() => openEditDialog(club)}
                      className="p-3 rounded-lg border bg-background hover:bg-accent cursor-pointer transition-colors"
                    >
                      <p className="font-semibold text-foreground truncate">{club.name}</p>
                      <p className="text-xs text-muted-foreground">Tap to edit</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Input
                    value={newClubName}
                    onChange={(e) => setNewClubName(e.target.value)}
                    placeholder="New club name"
                    className="flex-1"
                    onKeyDown={(e) => e.key === "Enter" && handleAddClub()}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleAddClub}
                    disabled={!newClubName.trim()}
                    className="shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Edit Club Dialog */}
        <Dialog open={editingClub !== null} onOpenChange={() => setEditingClub(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Club</DialogTitle>
            </DialogHeader>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Club name"
              onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
            />
            <DialogFooter className="flex gap-2 sm:gap-0">
              <Button
                variant="destructive"
                onClick={handleDeleteClub}
                className="flex-1 sm:flex-none"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button onClick={handleSaveEdit} className="flex-1 sm:flex-none">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stat Tracking Section - Collapsible */}
        <Accordion type="single" collapsible>
          <AccordionItem value="stat-tracking" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="text-left">
                <h2 className="text-lg font-semibold text-foreground">Stat Tracking</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Choose which stats to track during your rounds
                </p>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 pb-4">
                {statOptions.map((option) => (
                  <div key={option.key} className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <Switch
                      checked={preferences[option.key]}
                      onCheckedChange={(checked) => updatePreference(option.key, checked)}
                    />
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Settings;
