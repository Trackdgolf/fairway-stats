import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStatPreferences, StatPreferences } from "@/hooks/useStatPreferences";

const Settings = () => {
  const navigate = useNavigate();
  const { preferences, updatePreference } = useStatPreferences();

  const statOptions: { key: keyof StatPreferences; label: string; description: string }[] = [
    { key: "fir", label: "FIR (Fairway in Regulation)", description: "Track fairway accuracy on tee shots" },
    { key: "gir", label: "GIR (Green in Regulation)", description: "Track greens hit in regulation" },
    { key: "scramble", label: "Scramble %", description: "Track scramble success when missing GIR" },
    { key: "putts", label: "Putts", description: "Track putts per hole" },
    { key: "teeClub", label: "Tee Club", description: "Track which club used off the tee" },
    { key: "approachClub", label: "Approach Club", description: "Track which club used for approach shots" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
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

        {/* Stat Tracking Section */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-foreground mb-4">Stat Tracking</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Choose which stats to track during your rounds
          </p>
          <div className="space-y-4">
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
        </Card>
      </div>
    </div>
  );
};

export default Settings;
