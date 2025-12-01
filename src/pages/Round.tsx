import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface HoleStats {
  score: number | null;
  fir: boolean | null;
  gir: boolean | null;
  scramble: 'yes' | 'no' | 'n/a' | null;
  putts: number | null;
  teeClub: string;
  approachClub: string;
}

const CLUBS = [
  "Driver",
  "3 Wood",
  "5 Wood",
  "7 Wood",
  "3 Hybrid",
  "4 Hybrid",
  "5 Hybrid",
  "3 Iron",
  "4 Iron",
  "5 Iron",
  "6 Iron",
  "7 Iron",
  "8 Iron",
  "9 Iron",
  "PW",
  "GW",
  "SW",
  "LW",
  "Putter",
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
          ? "bg-primary/20 text-primary border-2 border-primary dark:bg-[hsl(var(--round-border))] dark:text-foreground dark:border-[hsl(var(--round-border))]" 
          : "bg-muted text-muted-foreground border border-border dark:bg-[hsl(var(--round-input))] dark:border-[hsl(var(--round-border))]",
        className
      )}
    >
      {children}
    </button>
  );
};

const Round = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;
  
  const [currentHoleIndex, setCurrentHoleIndex] = useState(0);
  const [holeStats, setHoleStats] = useState<HoleStats[]>(
    course?.holes?.map(() => ({
      score: null,
      fir: null,
      gir: null,
      scramble: null,
      putts: null,
      teeClub: "",
      approachClub: "",
    })) || []
  );

  const updateHoleStats = (field: keyof HoleStats, value: any) => {
    const newStats = [...holeStats];
    newStats[currentHoleIndex] = {
      ...newStats[currentHoleIndex],
      [field]: value,
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
            onChange={(val) => updateHoleStats("score", val)}
            min={1}
            max={15}
          />

          {/* FIR & GIR Row */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                FIR
              </label>
              <div className="flex gap-2">
                <ToggleButton
                  selected={currentStats?.fir === true}
                  onClick={() => updateHoleStats("fir", true)}
                >
                  Yes
                </ToggleButton>
                <ToggleButton
                  selected={currentStats?.fir === false}
                  onClick={() => updateHoleStats("fir", false)}
                >
                  No
                </ToggleButton>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                GIR
              </label>
              <div className="flex gap-2">
                <ToggleButton
                  selected={currentStats?.gir === true}
                  onClick={() => updateHoleStats("gir", true)}
                >
                  Yes
                </ToggleButton>
                <ToggleButton
                  selected={currentStats?.gir === false}
                  onClick={() => updateHoleStats("gir", false)}
                >
                  No
                </ToggleButton>
              </div>
            </div>
          </div>

          {/* Scramble */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Scramble %
            </label>
            <div className="flex gap-2">
              <ToggleButton
                selected={currentStats?.scramble === 'yes'}
                onClick={() => updateHoleStats("scramble", 'yes')}
              >
                Yes
              </ToggleButton>
              <ToggleButton
                selected={currentStats?.scramble === 'no'}
                onClick={() => updateHoleStats("scramble", 'no')}
              >
                No
              </ToggleButton>
              <ToggleButton
                selected={currentStats?.scramble === 'n/a'}
                onClick={() => updateHoleStats("scramble", 'n/a')}
              >
                N/A
              </ToggleButton>
            </div>
          </div>

          {/* Putts */}
          <NumberStepper
            label="Putts"
            value={currentStats?.putts}
            onChange={(val) => updateHoleStats("putts", val)}
            min={0}
            max={10}
          />

          {/* Tee Club */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Tee Club
            </label>
            <Select
              value={currentStats?.teeClub || ""}
              onValueChange={(value) => updateHoleStats("teeClub", value)}
            >
              <SelectTrigger className="h-14 bg-muted dark:bg-[hsl(var(--round-input))] border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground">
                <SelectValue placeholder="Select Club" />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
                {CLUBS.map((club) => (
                  <SelectItem 
                    key={club} 
                    value={club}
                    className="text-foreground focus:bg-muted dark:focus:bg-[hsl(var(--round-input))] focus:text-foreground"
                  >
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Approach Club */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Approach Club
            </label>
            <Select
              value={currentStats?.approachClub || ""}
              onValueChange={(value) => updateHoleStats("approachClub", value)}
            >
              <SelectTrigger className="h-14 bg-muted dark:bg-[hsl(var(--round-input))] border-border dark:border-[hsl(var(--round-border))] rounded-xl text-foreground">
                <SelectValue placeholder="Select Club" />
              </SelectTrigger>
              <SelectContent className="bg-card dark:bg-[hsl(var(--round-card))] border-border dark:border-[hsl(var(--round-border))]">
                {CLUBS.map((club) => (
                  <SelectItem 
                    key={club} 
                    value={club}
                    className="text-foreground focus:bg-muted dark:focus:bg-[hsl(var(--round-input))] focus:text-foreground"
                  >
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
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
            onClick={() => {
              if (currentHoleIndex === totalHoles - 1) {
                navigate('/');
              } else {
                setCurrentHoleIndex(Math.min(totalHoles - 1, currentHoleIndex + 1));
              }
            }}
            className="flex-1 h-14 rounded-xl bg-primary hover:bg-primary/90 dark:bg-[hsl(var(--round-accent))] dark:hover:bg-[hsl(var(--round-accent-hover))] text-white font-medium transition-all flex items-center justify-center gap-2"
          >
            {currentHoleIndex === totalHoles - 1 ? "Finish Round" : "Next"}
            {currentHoleIndex !== totalHoles - 1 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Round;
