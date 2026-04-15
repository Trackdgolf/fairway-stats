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
  {
    category: "Driving",
    drills: [
      {
        id: "DRV-001",
        title: "Alignment Stick Tee Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Alignment stick, driver",
        durationMins: 15,
        description: "Lay an alignment stick along the ground parallel to your target line, just outside the ball. Hit 15 drives, checking that your feet, hips, and shoulders are all parallel to the stick. Poor alignment is the most common cause of missed fairways.",
        coachingCue: "Aim the clubface first, then build your body alignment around it — not the other way round.",
      },
      {
        id: "DRV-002",
        title: "Tee Height Experiment",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Tees of different heights, driver",
        durationMins: 15,
        description: "Hit 5 drives with the ball teed low (half the ball above the clubhead), 5 teed standard (equator at crown height), and 5 teed high (full ball above crown). Note which height produces the straightest, most consistent contact and adopt it as your standard.",
        coachingCue: "Higher tee equals more upward angle of attack equals less spin and more carry. Find what works for your swing.",
      },
      {
        id: "DRV-003",
        title: "Glove Under Lead Arm",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Glove or headcover, driver",
        durationMins: 15,
        description: "Tuck a glove or small headcover under your lead armpit (left armpit for right-handers) and hold it there throughout your swing. If it drops during the backswing or downswing, your arm connection is breaking down. Hit 20 drives keeping it in place.",
        coachingCue: "The glove staying in place means your arms and body are rotating together — the key to a consistent strike.",
      },
      {
        id: "DRV-004",
        title: "Feet Together Balance Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Driver",
        durationMins: 10,
        description: "Stand with your feet touching each other and hit 10 drives at 60% effort. You cannot swing hard without falling over, which forces you to find the centre of your swing arc. This drill rapidly improves balance, tempo, and centred contact.",
        coachingCue: "If you fall off balance, you're swinging too hard. Let the club do the work.",
      },
      {
        id: "DRV-005",
        title: "Tempo 3:1 Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Driver",
        durationMins: 15,
        description: "Count 1-2-3 on your backswing and 1 on your downswing, creating a 3:1 backswing-to-downswing tempo ratio. Hit 15 drives using this count out loud. Tour players' tempos vary but almost all maintain a consistent 3:1 ratio regardless of swing speed.",
        coachingCue: "Rushing the downswing is the number one cause of a slice. A slower transition keeps the club on plane.",
      },
      {
        id: "DRV-006",
        title: "Impact Bag Drill",
        difficulty: "Intermediate",
        targetHdcp: "8-18",
        equipment: "Impact bag or old bag of grass cuttings",
        durationMins: 10,
        description: "Place an impact bag or stuffed duffel bag where the ball would be. Swing into it at medium pace, focusing on having your hands ahead of the bag at the moment of contact. Hold your finish and check your lead wrist is flat, not cupped.",
        coachingCue: "Hands ahead of the ball at impact is the single most important position for straight, powerful driving.",
      },
      {
        id: "DRV-007",
        title: "Half-Speed Accuracy Drill",
        difficulty: "Beginner",
        targetHdcp: "18+",
        equipment: "Driver, alignment sticks or towels as targets",
        durationMins: 15,
        description: "Place two alignment sticks 20 yards apart to represent a fairway. Hit 15 drives at half your normal swing speed, focusing entirely on hitting between the sticks. Gradually increase speed only when you can hit 10 of 15 in the target zone.",
        coachingCue: "Accuracy comes before speed. Build the pattern at half pace, then turn up the volume.",
      },
      {
        id: "DRV-008",
        title: "Tee Drill — Swing Path",
        difficulty: "Advanced",
        targetHdcp: "0-8",
        equipment: "4 tees, driver",
        durationMins: 15,
        description: "Push 4 tees into the ground to create a box just larger than your clubhead: one tee at the back-outside, one at the front-inside, and two at the sides. Swing through the box without knocking the inside-back tee, which trains an inside-out swing path and eliminates the over-the-top move that causes slices.",
        coachingCue: "If you knock the back-outside tee, your path is over the top. If you clip the front-inside tee, you are swinging too far in-to-out.",
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
