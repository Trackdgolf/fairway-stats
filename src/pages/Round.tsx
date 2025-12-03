import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Check, ChevronLeft, ChevronRight, Circle, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useStatPreferences } from "@/hooks/useStatPreferences";
import { useMyBag } from "@/hooks/useMyBag";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FirDirection = 'hit' | 'left' | 'right' | 'short' | null;
type GirDirection = 'hit' | 'left' | 'right' | 'long' | 'short' | null;

interface HoleStats {
  score: number | null;
  fir: boolean | null;
  firDirection: FirDirection;
  gir: boolean | null;
  girDirection: GirDirection;
  scramble: 'yes' | 'no' | 'n/a' | null;
  putts: number | null;
  teeClub: string;
  approachClub: string;
  scrambleClub: string;
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
          <button
            key={option.value as string}
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
        );
      })}
    </div>
  );
};

const Round = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { preferences } = useStatPreferences();
  const { clubs } = useMyBag();
  const course = location.state?.course;
  
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [holeStats, setHoleStats] = useState<HoleStats[]>(
    course?.holes?.map((hole: { par?: number }) => ({
      score: hole?.par || null,
      fir: null,
      firDirection: null,
      gir: null,
      girDirection: null,
      scramble: null,
      putts: null,
      teeClub: "",
      approachClub: "",
      scrambleClub: "",
    })) || []
  );

  const updateHoleStats = (updates: Partial<HoleStats>) => {
    const newStats = [...holeStats];
    newStats[currentHoleIndex] = {
      ...newStats[currentHoleIndex],
      ...updates,
    };
    setHoleStats(newStats);
  };

  const currentHole = course?.holes?.[currentHoleIndex];
  const currentStats = holeStats[currentHoleIndex];
  const totalHoles = course?.holes?.length || 18;

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-4">No course selected</p>
          <Button onClick={() => navigate('/course-search')}>
            Select a Course
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-[hsl(var(--round-bg))] pb-20">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-8 pb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {course.course_name || course.club_name}
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="p-2 -mr-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            <Check className="w-6 h-6" />
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
                  {currentHole?.length_meters}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalHoles }).map((_, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    idx === currentHoleIndex
                      ? "bg-primary dark:bg-[hsl(var(--round-accent))]"
                      : holeStats[idx]?.score !== null
                      ? "bg-primary/40 dark:bg-[hsl(var(--round-accent))]/40"
                      : "bg-border dark:bg-[hsl(var(--round-border))]"
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
            value={currentStats?.score}
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
                      selected={currentStats?.fir === true}
                      onClick={() => updateHoleStats({ fir: true, firDirection: 'hit' })}
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      selected={currentStats?.fir === false}
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
                      selected={currentStats?.gir === true}
                      onClick={() => updateHoleStats({ gir: true, scramble: 'n/a', girDirection: 'hit' })}
                    >
                      Yes
                    </ToggleButton>
                    <ToggleButton
                      selected={currentStats?.gir === false}
                      onClick={() => updateHoleStats({ gir: false })}
                    >
                      No
                    </ToggleButton>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Scramble - only show when GIR is not Yes and scramble tracking is enabled */}
          {preferences.scramble && currentStats?.gir !== true && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Scramble %
              </label>
              <div className="flex gap-2">
                <ToggleButton
                  selected={currentStats?.scramble === 'yes'}
                  onClick={() => updateHoleStats({ scramble: 'yes', putts: 1 })}
                >
                  Yes
                </ToggleButton>
                <ToggleButton
                  selected={currentStats?.scramble === 'no'}
                  onClick={() => updateHoleStats({ scramble: 'no' })}
                >
                  No
                </ToggleButton>
                <ToggleButton
                  selected={currentStats?.scramble === 'n/a'}
                  onClick={() => updateHoleStats({ scramble: 'n/a', scrambleClub: "" })}
                >
                  N/A
                </ToggleButton>
              </div>
            </div>
          )}

          {/* Scramble Club - only show when Scramble is Yes or No */}
          {preferences.scramble && (currentStats?.scramble === 'yes' || currentStats?.scramble === 'no') && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Scramble Club
              </label>
              <Select
                value={currentStats?.scrambleClub || ""}
                onValueChange={(value) => updateHoleStats({ scrambleClub: value })}
              >
                <SelectTrigger className="h-14 bg-muted dark:bg-[hsl(var(--round-input))] border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground">
                  <SelectValue placeholder="Select Club" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
                  {clubs.map((club) => (
                    <SelectItem 
                      key={club.id} 
                      value={club.name}
                      className="text-foreground focus:bg-muted dark:focus:bg-[hsl(var(--round-input))] focus:text-foreground"
                    >
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Putts */}
          {preferences.putts && (
            <NumberStepper
              label="Putts"
              value={currentStats?.putts}
              onChange={(val) => updateHoleStats({ putts: val })}
              min={0}
              max={10}
            />
          )}

          {/* Tee Club */}
          {preferences.teeClub && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Tee Club
              </label>
              <Select
                value={currentStats?.teeClub || ""}
                onValueChange={(value) => updateHoleStats({ teeClub: value })}
              >
                <SelectTrigger className="h-14 bg-muted dark:bg-[hsl(var(--round-input))] border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground">
                  <SelectValue placeholder="Select Club" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
                  {clubs.map((club) => (
                    <SelectItem 
                      key={club.id} 
                      value={club.name}
                      className="text-foreground focus:bg-muted dark:focus:bg-[hsl(var(--round-input))] focus:text-foreground"
                    >
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* FIR direction - only shown on non-Par 3s */}
              {preferences.fir && currentHole?.par !== 3 && (
                <ShotDirectionSelector
                  options={FIR_DIRECTIONS}
                  selectedValue={currentStats?.firDirection}
                  onSelect={(value) => updateHoleStats({ firDirection: value })}
                />
              )}
              {/* GIR direction - shown on Par 3s under Tee Club since tee shot = approach */}
              {preferences.gir && currentHole?.par === 3 && (
                <ShotDirectionSelector
                  options={GIR_DIRECTIONS}
                  selectedValue={currentStats?.girDirection}
                  onSelect={(value) => updateHoleStats({ girDirection: value })}
                />
              )}
            </div>
          )}

          {/* Approach Club - hidden on Par 3s */}
          {preferences.approachClub && currentHole?.par !== 3 && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Approach Club
              </label>
              <Select
                value={currentStats?.approachClub || ""}
                onValueChange={(value) => updateHoleStats({ approachClub: value })}
              >
                <SelectTrigger className="h-14 bg-muted dark:bg-[hsl(var(--round-input))] border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground">
                  <SelectValue placeholder="Select Club" />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
                  {clubs.map((club) => (
                    <SelectItem 
                      key={club.id} 
                      value={club.name}
                      className="text-foreground focus:bg-muted dark:focus:bg-[hsl(var(--round-input))] focus:text-foreground"
                    >
                      {club.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {preferences.gir && (
                <ShotDirectionSelector
                  options={GIR_DIRECTIONS}
                  selectedValue={currentStats?.girDirection}
                  onSelect={(value) => updateHoleStats({ girDirection: value })}
                />
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-4 mt-8 mb-6 flex gap-3">
          <button
            onClick={() => setCurrentHoleIndex(Math.max(0, currentHoleIndex - 1))}
            disabled={currentHoleIndex === 0}
            className="flex-1 h-14 rounded-xl bg-card dark:bg-[hsl(var(--round-card))] border border-border dark:border-[hsl(var(--round-border))] text-foreground font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:bg-muted dark:hover:bg-[hsl(var(--round-input))] flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
          <button
            onClick={async () => {
              if (currentHoleIndex === totalHoles - 1) {
                // Finish round - save to database
                setIsSaving(true);
                try {
                  // Calculate total score
                  const totalScore = holeStats.reduce((sum, stat) => sum + (stat.score || 0), 0);
                  
                  // Insert round
                  const { data: roundData, error: roundError } = await supabase
                    .from('rounds')
                    .insert({
                      course_name: course.course_name || course.club_name,
                      course_id: course.id?.toString(),
                      total_score: totalScore,
                    })
                    .select()
                    .single();

                  if (roundError) throw roundError;

                  // Insert hole stats
                  const holeStatsToInsert = holeStats.map((stat, idx) => {
                    const holePar = course.holes?.[idx]?.par;
                    const isPar3 = holePar === 3;
                    
                    return {
                      round_id: roundData.id,
                      hole_number: idx + 1,
                      par: holePar,
                      score: stat.score,
                      // No FIR on Par 3s - the tee shot is the approach
                      fir: isPar3 ? null : stat.fir,
                      fir_direction: isPar3 ? null : stat.firDirection,
                      gir: stat.gir,
                      gir_direction: stat.girDirection,
                      scramble: stat.scramble,
                      putts: stat.putts,
                      // On Par 3s, tee club IS the approach club
                      tee_club: isPar3 ? null : (stat.teeClub || null),
                      approach_club: isPar3 ? (stat.teeClub || null) : (stat.approachClub || null),
                      scramble_club: stat.scrambleClub || null,
                    };
                  });

                  const { error: statsError } = await supabase
                    .from('hole_stats')
                    .insert(holeStatsToInsert);

                  if (statsError) throw statsError;

                  toast({
                    title: "Round saved!",
                    description: `Your round at ${course.course_name || course.club_name} has been recorded.`,
                  });
                  navigate('/');
                } catch (error) {
                  console.error('Error saving round:', error);
                  toast({
                    title: "Error saving round",
                    description: "Please try again.",
                    variant: "destructive",
                  });
                } finally {
                  setIsSaving(false);
                }
              } else {
                setCurrentHoleIndex(Math.min(totalHoles - 1, currentHoleIndex + 1));
              }
            }}
            disabled={isSaving}
            className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 dark:bg-[hsl(var(--round-accent))] dark:hover:bg-[hsl(var(--round-accent-hover))] text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : currentHoleIndex === totalHoles - 1 ? "Finish Round" : "Next"}
            {currentHoleIndex !== totalHoles - 1 && !isSaving && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Round;
