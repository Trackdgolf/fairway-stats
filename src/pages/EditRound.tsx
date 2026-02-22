import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Circle, Minus, Plus, Trash2, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import ClubSelectorDrawer from "@/components/ClubSelectorDrawer";

type FirDirection = 'hit' | 'left' | 'right' | 'short' | null;
type GirDirection = 'hit' | 'left' | 'right' | 'long' | 'short' | null;
type ScrambleShotType = 'pitch' | 'chip' | 'bunker' | null;

interface HoleStats {
  id: string;
  hole_number: number;
  par: number | null;
  score: number | null;
  fir: boolean | null;
  fir_direction: FirDirection;
  gir: boolean | null;
  gir_direction: GirDirection;
  scramble: string | null;
  putts: number | null;
  tee_club: string | null;
  approach_club: string | null;
  scramble_club: string | null;
  scramble_shot_type: ScrambleShotType;
  yardage: number | null;
  penalties: number | null;
}

const FIR_DIRECTIONS: { icon: typeof Circle; value: FirDirection; label: string }[] = [
  { icon: Circle, value: 'hit', label: 'Hit' },
  { icon: ArrowDown, value: 'short', label: 'Short' },
  { icon: ArrowLeft, value: 'left', label: 'Left' },
  { icon: ArrowRight, value: 'right', label: 'Right' },
];

const GIR_DIRECTIONS: { icon: typeof Circle; value: GirDirection; label: string }[] = [
  { icon: Circle, value: 'hit', label: 'Hit' },
  { icon: ArrowDown, value: 'short', label: 'Short' },
  { icon: ArrowUp, value: 'long', label: 'Long' },
  { icon: ArrowLeft, value: 'left', label: 'Left' },
  { icon: ArrowRight, value: 'right', label: 'Right' },
];

// Number Stepper Component
const NumberStepper = ({ 
  label, 
  value, 
  onChange, 
  min = 0, 
  max = 15 
}: { 
  label: string; 
  value: number | null; 
  onChange: (val: number | null) => void;
  min?: number;
  max?: number;
}) => {
  const handleDecrement = () => {
    const current = value || 0;
    if (current > min) onChange(current - 1);
  };

  const handleIncrement = () => {
    const current = value || 0;
    if (current < max) onChange(current + 1);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </label>
      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={handleDecrement}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 dark:bg-[hsl(var(--round-accent))] dark:hover:bg-[hsl(var(--round-accent-hover))] text-white dark:text-primary-foreground flex items-center justify-center transition-colors shadow-lg"
        >
          <Minus className="w-6 h-6" />
        </button>
        <div className="w-24 h-16 bg-muted dark:bg-[hsl(var(--round-input))] border border-border dark:border-[hsl(var(--round-border))] rounded-2xl flex items-center justify-center">
          <span className="text-4xl font-bold text-foreground">{value || 0}</span>
        </div>
        <button
          type="button"
          onClick={handleIncrement}
          className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 dark:bg-[hsl(var(--round-accent))] dark:hover:bg-[hsl(var(--round-accent-hover))] text-white dark:text-primary-foreground flex items-center justify-center transition-colors shadow-lg"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// Toggle Button Component
const ToggleButton = ({ 
  selected, 
  onClick, 
  children,
  className
}: { 
  selected: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 h-12 rounded-xl font-medium transition-all",
        selected 
          ? "bg-primary/20 text-yellow-500 border-2 border-primary dark:bg-[hsl(var(--round-accent))]/20 dark:text-yellow-400 dark:border-[hsl(var(--round-accent))]" 
          : "bg-muted text-muted-foreground border border-border dark:bg-[hsl(var(--round-input))] dark:border-[hsl(var(--round-border))]",
        className
      )}
    >
      {children}
    </button>
  );
};

// Shot Direction Selector Component
const ShotDirectionSelector = <T extends string | null>({ 
  options, 
  selectedValue, 
  onSelect 
}: { 
  options: { icon: typeof Circle; value: T; label: string }[];
  selectedValue: T;
  onSelect: (value: T) => void;
}) => {
  return (
    <div className="flex justify-center gap-3 mt-3">
      {options.map((option) => {
        const Icon = option.icon;
        const isSelected = selectedValue === option.value;
        return (
          <div key={option.value as string} className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                isSelected
                  ? "bg-primary text-primary-foreground border-2 border-primary dark:bg-[hsl(var(--round-accent))] dark:border-[hsl(var(--round-accent))]"
                  : "bg-muted text-muted-foreground border border-border dark:bg-[hsl(var(--round-input))] dark:border-[hsl(var(--round-border))] hover:bg-muted/80 dark:hover:bg-[hsl(var(--round-input))]/80"
              )}
              title={option.label}
            >
              <Icon className="w-5 h-5" />
            </button>
            <span className="text-[10px] text-muted-foreground">{option.label}</span>
          </div>
        );
      })}
    </div>
  );
};

const EditRound = () => {
  const { roundId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { statPreferences: preferences, clubs } = useUserPreferences();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const supabase = getSupabaseClient();
  
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [holeStats, setHoleStats] = useState<HoleStats[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [teeClubDrawerOpen, setTeeClubDrawerOpen] = useState(false);
  const [approachClubDrawerOpen, setApproachClubDrawerOpen] = useState(false);
  const [scrambleClubDrawerOpen, setScrambleClubDrawerOpen] = useState(false);

  // Fetch round data
  const { data: roundData, isLoading: roundLoading } = useQuery({
    queryKey: ["round", roundId],
    queryFn: async () => {
      if (!roundId) return null;
      const { data, error } = await supabase
        .from("rounds")
        .select("*")
        .eq("id", roundId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!roundId,
  });

  // Fetch hole stats
  const { data: fetchedHoleStats, isLoading: statsLoading } = useQuery({
    queryKey: ["hole-stats", roundId],
    queryFn: async () => {
      if (!roundId) return [];
      const { data, error } = await supabase
        .from("hole_stats")
        .select("*")
        .eq("round_id", roundId)
        .order("hole_number", { ascending: true });
      
      if (error) throw error;
      return data as HoleStats[];
    },
    enabled: !!roundId,
  });

  useEffect(() => {
    if (fetchedHoleStats) {
      setHoleStats(fetchedHoleStats);
    }
  }, [fetchedHoleStats]);

  const currentHole = holeStats[currentHoleIndex];
  const totalHoles = holeStats.length;

  const updateHoleStats = (updates: Partial<HoleStats>) => {
    const newStats = [...holeStats];
    newStats[currentHoleIndex] = {
      ...newStats[currentHoleIndex],
      ...updates,
    };
    setHoleStats(newStats);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!roundId || !user) return;

    setIsSaving(true);
    try {
      // Update each hole stat
      for (const hole of holeStats) {
        const { error } = await supabase
          .from("hole_stats")
          .update({
            score: hole.score,
            fir: hole.fir,
            fir_direction: hole.fir_direction,
            gir: hole.gir,
            gir_direction: hole.gir_direction,
            scramble: hole.scramble,
            putts: hole.putts,
            tee_club: hole.tee_club,
            approach_club: hole.approach_club,
            scramble_club: hole.scramble_club,
            scramble_shot_type: hole.scramble_shot_type,
            penalties: hole.penalties,
          })
          .eq("id", hole.id);

        if (error) throw error;
      }

      // Update total score in rounds table
      const totalScore = holeStats.reduce((sum, stat) => sum + (stat.score || 0), 0);
      await supabase
        .from("rounds")
        .update({ total_score: totalScore })
        .eq("id", roundId);

      // Invalidate queries to refresh stats
      queryClient.invalidateQueries({ queryKey: ["completed-rounds"] });
      queryClient.invalidateQueries({ queryKey: ["round-stats"] });

      toast({
        title: "Round updated",
        description: "Your changes have been saved.",
      });
      setHasChanges(false);
      navigate("/");
    } catch (error) {
      console.error("Error saving round:", error);
      toast({
        title: "Error saving round",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!roundId) return;

    try {
      // Delete hole stats first (foreign key constraint)
      await supabase.from("hole_stats").delete().eq("round_id", roundId);
      
      // Delete round
      await supabase.from("rounds").delete().eq("id", roundId);

      // Invalidate queries to refresh stats
      queryClient.invalidateQueries({ queryKey: ["completed-rounds"] });
      queryClient.invalidateQueries({ queryKey: ["round-stats"] });

      toast({
        title: "Round deleted",
        description: "The round has been removed.",
      });
      navigate("/");
    } catch (error) {
      console.error("Error deleting round:", error);
      toast({
        title: "Error deleting round",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (roundLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading round...</p>
      </div>
    );
  }

  if (!roundData || holeStats.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">Round not found</p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(var(--round-bg))] pb-24" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-8 pb-6">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              Edit: {roundData.course_name}
            </h1>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 -mr-2 text-destructive hover:text-destructive/80 transition-colors"
          >
            <Trash2 className="w-6 h-6" />
          </button>
        </div>

        {/* Hole Info & Progress */}
        <div className="px-4 mb-6">
          <div className="bg-card dark:bg-[hsl(var(--round-card))] rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-around mb-6">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Hole</div>
                <div className="text-5xl font-bold text-foreground">
                  {currentHoleIndex + 1}
                </div>
              </div>
              <div className="w-px h-16 bg-border dark:bg-[hsl(var(--round-border))]" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Par</div>
                <div className="text-5xl font-bold text-foreground">
                  {currentHole?.par}
                </div>
              </div>
              <div className="w-px h-16 bg-border dark:bg-[hsl(var(--round-border))]" />
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Yards</div>
                <div className="text-3xl font-semibold text-foreground">
                  {currentHole?.yardage ?? '-'}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalHoles }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHoleIndex(idx)}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors cursor-pointer hover:opacity-80",
                    idx === currentHoleIndex
                      ? "bg-primary dark:bg-[hsl(var(--round-accent))]"
                      : "bg-primary/40 dark:bg-[hsl(var(--round-accent))]/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats Entry */}
        <div className="px-4 space-y-8">
          {/* Score */}
          <NumberStepper
            label="Score"
            value={currentHole?.score}
            onChange={(val) => updateHoleStats({ score: val })}
            min={1}
            max={15}
          />

          {/* FIR & GIR Row */}
          {(preferences.fir || preferences.gir) && (
            <div className={cn("grid gap-6", preferences.fir && currentHole?.par !== 3 && preferences.gir ? "grid-cols-2" : "grid-cols-1")}>
              {preferences.fir && currentHole?.par !== 3 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    FIR
                  </label>
                  <div className="flex gap-2">
                    <ToggleButton
                      selected={currentHole?.fir === true}
                      onClick={() => updateHoleStats({ fir: true, fir_direction: 'hit' })}
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      selected={currentHole?.fir === false}
                      onClick={() => updateHoleStats({ fir: false })}
                    >
                      No
                    </ToggleButton>
                  </div>
                </div>
              )}

              {preferences.gir && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    GIR
                  </label>
                  <div className="flex gap-2">
                    <ToggleButton
                      selected={currentHole?.gir === true}
                      onClick={() => updateHoleStats({ gir: true, gir_direction: 'hit', scramble: 'n/a' })}
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      selected={currentHole?.gir === false}
                      onClick={() => updateHoleStats({ gir: false })}
                    >
                      No
                    </ToggleButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scramble - only show when GIR is not Yes */}
          {preferences.scramble && currentHole?.gir !== true && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Scramble %
              </label>
              <div className="flex gap-2">
                <ToggleButton
                  selected={currentHole?.scramble === 'yes'}
                  onClick={() => updateHoleStats({ scramble: 'yes', putts: currentHole?.putts ?? 1 })}
                >
                  Yes
                </ToggleButton>
                <ToggleButton
                  selected={currentHole?.scramble === 'no'}
                  onClick={() => updateHoleStats({ scramble: 'no' })}
                >
                  No
                </ToggleButton>
                <ToggleButton
                  selected={currentHole?.scramble === 'n/a'}
                  onClick={() => updateHoleStats({ scramble: 'n/a', scramble_club: null, scramble_shot_type: null })}
                >
                  N/A
                </ToggleButton>
              </div>
            </div>
          )}

          {/* Scramble Club - only show when Scramble is Yes or No */}
          {preferences.scramble && (currentHole?.scramble === 'yes' || currentHole?.scramble === 'no') && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Scramble Club
              </label>
              <button
                type="button"
                onClick={() => setScrambleClubDrawerOpen(true)}
                className="w-full h-14 bg-muted dark:bg-[hsl(var(--round-input))] border border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground flex items-center justify-between px-4"
              >
                <span className={currentHole?.scramble_club ? "text-foreground" : "text-muted-foreground"}>
                  {currentHole?.scramble_club || "Select Club"}
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              <ClubSelectorDrawer
                open={scrambleClubDrawerOpen}
                onOpenChange={setScrambleClubDrawerOpen}
                title="Select Scramble Club"
                clubs={clubs}
                selectedClub={currentHole?.scramble_club || ""}
                onSelect={(value) => updateHoleStats({ scramble_club: value })}
              />

              {/* Scramble Shot Type */}
              <div className="space-y-3 mt-4">
                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Shot Type
                </label>
                <div className="flex gap-2">
                  <ToggleButton
                    selected={currentHole?.scramble_shot_type === 'pitch'}
                    onClick={() => updateHoleStats({ scramble_shot_type: 'pitch' })}
                  >
                    Pitch
                  </ToggleButton>
                  <ToggleButton
                    selected={currentHole?.scramble_shot_type === 'chip'}
                    onClick={() => updateHoleStats({ scramble_shot_type: 'chip' })}
                  >
                    Chip
                  </ToggleButton>
                  <ToggleButton
                    selected={currentHole?.scramble_shot_type === 'bunker'}
                    onClick={() => updateHoleStats({ scramble_shot_type: 'bunker' })}
                  >
                    Bunker
                  </ToggleButton>
                </div>
              </div>
            </div>
          )}

          {/* Putts */}
          {preferences.putts && (
            <NumberStepper
              label="Putts"
              value={currentHole?.putts}
              onChange={(val) => updateHoleStats({ putts: val })}
              min={0}
              max={10}
            />
          )}

          {/* Penalty Shots */}
          <NumberStepper
            label="Penalty Shots"
            value={currentHole?.penalties}
            onChange={(val) => updateHoleStats({ penalties: val })}
            min={0}
            max={10}
          />

          {/* Tee Club */}
          {preferences.teeClub && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Tee Club
              </label>
              <button
                type="button"
                onClick={() => setTeeClubDrawerOpen(true)}
                className="w-full h-14 bg-muted dark:bg-[hsl(var(--round-input))] border border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground flex items-center justify-between px-4"
              >
                <span className={currentHole?.tee_club ? "text-foreground" : "text-muted-foreground"}>
                  {currentHole?.tee_club || "Select Club"}
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              <ClubSelectorDrawer
                open={teeClubDrawerOpen}
                onOpenChange={setTeeClubDrawerOpen}
                title="Select Tee Club"
                clubs={clubs}
                selectedClub={currentHole?.tee_club || ""}
                onSelect={(value) => updateHoleStats({ tee_club: value })}
              />
              {/* FIR direction - only shown on non-Par 3s */}
              {preferences.fir && currentHole?.par !== 3 && (
                <>
                  <p className="text-xs text-muted-foreground text-center mt-3 uppercase tracking-wide">Fairway</p>
                  <ShotDirectionSelector
                    options={FIR_DIRECTIONS}
                    selectedValue={currentHole?.fir_direction}
                    onSelect={(value) => updateHoleStats({ fir_direction: value })}
                  />
                </>
              )}
              {/* GIR direction - shown on Par 3s under Tee Club since tee shot = approach */}
              {preferences.gir && currentHole?.par === 3 && (
                <>
                  <p className="text-xs text-muted-foreground text-center mt-3 uppercase tracking-wide">Green</p>
                  <ShotDirectionSelector
                    options={GIR_DIRECTIONS}
                    selectedValue={currentHole?.gir_direction}
                    onSelect={(value) => updateHoleStats({ gir_direction: value })}
                  />
                </>
              )}
            </div>
          )}

          {/* Approach Club - hidden on Par 3s */}
          {preferences.approachClub && currentHole?.par !== 3 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Approach Club
              </label>
              <button
                type="button"
                onClick={() => setApproachClubDrawerOpen(true)}
                className="w-full h-14 bg-muted dark:bg-[hsl(var(--round-input))] border border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground flex items-center justify-between px-4"
              >
                <span className={currentHole?.approach_club ? "text-foreground" : "text-muted-foreground"}>
                  {currentHole?.approach_club || "Select Club"}
                </span>
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              </button>
              <ClubSelectorDrawer
                open={approachClubDrawerOpen}
                onOpenChange={setApproachClubDrawerOpen}
                title="Select Approach Club"
                clubs={clubs}
                selectedClub={currentHole?.approach_club || ""}
                onSelect={(value) => updateHoleStats({ approach_club: value })}
              />
              {preferences.gir && (
                <>
                  <p className="text-xs text-muted-foreground text-center mt-3 uppercase tracking-wide">Green</p>
                  <ShotDirectionSelector
                    options={GIR_DIRECTIONS}
                    selectedValue={currentHole?.gir_direction}
                    onSelect={(value) => updateHoleStats({ gir_direction: value })}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* Navigation & Save */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-gradient-to-t from-background dark:from-[hsl(var(--round-bg))] to-transparent">
          <div className="max-w-md mx-auto flex gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCurrentHoleIndex(Math.max(0, currentHoleIndex - 1))}
              disabled={currentHoleIndex === 0}
              className="flex-1"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </Button>
            {currentHoleIndex < totalHoles - 1 ? (
              <Button
                size="lg"
                onClick={() => setCurrentHoleIndex(currentHoleIndex + 1)}
                className="flex-1"
              >
                Next
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex-1"
              >
                <Check className="w-5 h-5 mr-1" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Round?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this round and all associated stats. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default EditRound;
