import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Clock, Target } from "lucide-react";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Drill {
  id: string;
  title: string;
  difficulty: Difficulty;
  targetHdcp: string;
  equipment: string;
  durationMins: number;
  description: string;
  coachingCue: string;
}

interface DrillCategory {
  category: string;
  drills: Drill[];
}

const difficultyColor: Record<Difficulty, string> = {
  Beginner: "bg-success text-success-foreground",
  Intermediate: "bg-warning text-warning-foreground",
  Advanced: "bg-destructive text-destructive-foreground",
};

const drillData: DrillCategory[] = [
  {
    category: "Putting",
    drills: [
      {
        id: "PUT-001",
        title: "Gate Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "2 tee pegs",
        durationMins: 10,
        description: "Push two tee pegs into the green just wider than your putter head, roughly 3 feet from the hole. Make 10 putts in a row through the gate. If you clip a tee, start your count again. Move to 6 feet once you can complete the challenge.",
        coachingCue: "Keep your eyes over the ball and stroke through the gate, not at it.",
      },
      {
        id: "PUT-002",
        title: "Clock Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "4 balls, tee pegs",
        durationMins: 15,
        description: "Place 4 balls around the hole at 3 feet, positioned like numbers on a clock — 3, 6, 9, and 12 o'clock. Hole all 4 in succession without missing. Once complete, move all balls back to 4 feet and repeat. This builds confidence from all angles.",
        coachingCue: "Pick your line, commit fully, and accelerate through impact on every putt.",
      },
      {
        id: "PUT-003",
        title: "Ladder Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "5 balls, tee pegs",
        durationMins: 15,
        description: "Place tee pegs at 10, 20, 30, 40, and 50 feet from the hole. Putt one ball from each distance in order, trying to finish within 3 feet of the hole each time. This drill trains distance control across all putt lengths.",
        coachingCue: "Focus on tempo and pendulum rhythm — a smooth stroke is more repeatable than a forced one.",
      },
      {
        id: "PUT-004",
        title: "Coin Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Coin or small sticker",
        durationMins: 10,
        description: "Place a coin or small sticker on the green and attempt to roll your putt so it comes to rest touching or on top of the coin from 6 feet. This extreme precision drill sharpens your focus on strike quality and starting line.",
        coachingCue: "Hit the sweet spot of the putter face every time — a centred strike rolls the ball true.",
      },
      {
        id: "PUT-005",
        title: "String Line Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "String or chalk line, 2 pegs",
        durationMins: 10,
        description: "Stretch a string or chalk line from behind the ball to just over the hole on a straight putt. Set up so the string runs directly down the centre of your putter face. Make 20 putts, using the line to verify your face is square at address and your ball rolls on the intended line.",
        coachingCue: "If the ball tracks left or right of the string, your face is open or closed at impact — adjust until it rolls dead straight.",
      },
      {
        id: "PUT-006",
        title: "One-Handed Putting",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Putter only",
        durationMins: 10,
        description: "Using only your lead hand (left for right-handers), make 20 putts from 6 feet. Then switch to your trail hand only for 20 more. This drill isolates each hand's role in the stroke, improving feel and exposing any dominant-hand overuse.",
        coachingCue: "The lead hand controls direction; the trail hand controls pace. Feel the difference.",
      },
      {
        id: "PUT-007",
        title: "Eyes Closed Drill",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "Putter only",
        durationMins: 10,
        description: "Set up to a putt from 4 feet. Close your eyes before you stroke and keep them closed through impact and follow-through. Listen for the ball to drop. This builds a feel-based stroke, reducing mechanical overthinking and improving tempo.",
        coachingCue: "Trust your rehearsal stroke — what you feel in practice is what you execute on the course.",
      },
      {
        id: "PUT-008",
        title: "3-6-9 Pressure Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "3 balls, tee pegs",
        durationMins: 15,
        description: "Place balls at 3, 6, and 9 feet from the hole. You must hole all three consecutively to complete the drill. If you miss any putt, start again from 3 feet. This replicates on-course pressure and builds a clutch putting routine.",
        coachingCue: "Slow your routine down when the pressure is on — take an extra breath before pulling the trigger.",
      },
    ],
  },
];

const DrillLibrary = () => {
  const [openDrills, setOpenDrills] = useState<Record<string, boolean>>({});

  const toggleDrill = (id: string) => {
    setOpenDrills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 mt-4">
      {drillData.map((category) => (
        <div key={category.category}>
          <h2 className="text-lg font-bold text-foreground mb-3">{category.category}</h2>
          <div className="space-y-3">
            {category.drills.map((drill) => (
              <Collapsible
                key={drill.id}
                open={openDrills[drill.id]}
                onOpenChange={() => toggleDrill(drill.id)}
              >
                <Card className="overflow-hidden">
                  <CollapsibleTrigger className="w-full text-left">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <ChevronDown
                            className={`w-4 h-4 shrink-0 transition-transform ${
                              openDrills[drill.id] ? "rotate-180" : ""
                            }`}
                          />
                          <CardTitle className="text-base leading-snug">{drill.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {drill.durationMins} min
                          </span>
                          <Badge className={difficultyColor[drill.difficulty]}>
                            {drill.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-3 pt-0">
                      <p className="text-sm text-muted-foreground leading-relaxed">{drill.description}</p>

                      <div className="flex items-start gap-2 rounded-md bg-primary/10 px-3 py-2">
                        <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-primary leading-relaxed">{drill.coachingCue}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          🎯 {drill.targetHdcp} hdcp
                        </span>
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                          🧰 {drill.equipment}
                        </span>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrillLibrary;
