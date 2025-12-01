import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No course selected</p>
          <Button onClick={() => navigate('/course-search')} className="mt-4">
            Select a Course
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">
              {course.course_name || course.club_name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {course.location?.city}, {course.location?.state}
            </p>
          </div>
        </div>

        {/* Hole Progress */}
        <Card className="p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-muted-foreground">Hole</div>
              <div className="text-3xl font-bold text-foreground">
                {currentHoleIndex + 1}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Par</div>
              <div className="text-3xl font-bold text-foreground">
                {currentHole?.par}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Yards</div>
              <div className="text-2xl font-semibold text-foreground">
                {currentHole?.length_meters}
              </div>
            </div>
          </div>
          <div className="flex gap-1 mt-4">
            {Array.from({ length: totalHoles }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1 flex-1 rounded ${
                  idx === currentHoleIndex
                    ? "bg-primary"
                    : holeStats[idx]?.score !== null
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </Card>

        {/* Stats Entry */}
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            {/* Score */}
            <div className="space-y-2">
              <Label htmlFor="score" className="text-foreground">Score</Label>
              <Input
                id="score"
                type="number"
                min="1"
                max="15"
                value={currentStats?.score || ""}
                onChange={(e) => updateHoleStats("score", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Enter score"
                className="text-lg"
              />
            </div>

            {/* FIR - Fairway in Regulation */}
            <div className="space-y-2">
              <Label className="text-foreground">Fairway in Regulation (FIR)</Label>
              <RadioGroup
                value={currentStats?.fir === null ? "" : currentStats?.fir ? "yes" : "no"}
                onValueChange={(value) => updateHoleStats("fir", value === "yes")}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="fir-yes" />
                    <Label htmlFor="fir-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="fir-no" />
                    <Label htmlFor="fir-no" className="font-normal">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* GIR - Green in Regulation */}
            <div className="space-y-2">
              <Label className="text-foreground">Green in Regulation (GIR)</Label>
              <RadioGroup
                value={currentStats?.gir === null ? "" : currentStats?.gir ? "yes" : "no"}
                onValueChange={(value) => updateHoleStats("gir", value === "yes")}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="gir-yes" />
                    <Label htmlFor="gir-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="gir-no" />
                    <Label htmlFor="gir-no" className="font-normal">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Scramble */}
            <div className="space-y-2">
              <Label className="text-foreground">Scramble</Label>
              <RadioGroup
                value={currentStats?.scramble || ""}
                onValueChange={(value) => updateHoleStats("scramble", value as 'yes' | 'no' | 'n/a')}
              >
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="scramble-yes" />
                    <Label htmlFor="scramble-yes" className="font-normal">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="scramble-no" />
                    <Label htmlFor="scramble-no" className="font-normal">No</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="n/a" id="scramble-na" />
                    <Label htmlFor="scramble-na" className="font-normal">N/A</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Putts */}
            <div className="space-y-2">
              <Label htmlFor="putts" className="text-foreground">Putts</Label>
              <Input
                id="putts"
                type="number"
                min="0"
                max="10"
                value={currentStats?.putts || ""}
                onChange={(e) => updateHoleStats("putts", e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Number of putts"
              />
            </div>

            {/* Tee Club */}
            <div className="space-y-2">
              <Label htmlFor="tee-club" className="text-foreground">Tee Club</Label>
              <Select
                value={currentStats?.teeClub || ""}
                onValueChange={(value) => updateHoleStats("teeClub", value)}
              >
                <SelectTrigger id="tee-club">
                  <SelectValue placeholder="Select club" />
                </SelectTrigger>
                <SelectContent>
                  {CLUBS.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Approach Club */}
            <div className="space-y-2">
              <Label htmlFor="approach-club" className="text-foreground">Approach Club</Label>
              <Select
                value={currentStats?.approachClub || ""}
                onValueChange={(value) => updateHoleStats("approachClub", value)}
              >
                <SelectTrigger id="approach-club">
                  <SelectValue placeholder="Select club" />
                </SelectTrigger>
                <SelectContent>
                  {CLUBS.map((club) => (
                    <SelectItem key={club} value={club}>
                      {club}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex gap-3 mb-6">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setCurrentHoleIndex(Math.max(0, currentHoleIndex - 1))}
            disabled={currentHoleIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              if (currentHoleIndex === totalHoles - 1) {
                // Finish round logic here
                navigate('/');
              } else {
                setCurrentHoleIndex(Math.min(totalHoles - 1, currentHoleIndex + 1));
              }
            }}
          >
            {currentHoleIndex === totalHoles - 1 ? "Finish Round" : "Next"}
            {currentHoleIndex !== totalHoles - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Round;
