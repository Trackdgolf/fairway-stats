import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Difficulty = "Beginner" | "Intermediate" | "Advanced";

interface Drill {
  title: string;
  difficulty: Difficulty;
  description: string;
  focuses: string[];
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
        title: "Gate Drill",
        difficulty: "Beginner",
        description: "Place two tees just wider than your putter head 6 feet from the hole. Roll putts through the gate to build a consistent stroke path.",
        focuses: ["Stroke path", "Face alignment", "Consistency"],
      },
      {
        title: "Clock Drill",
        difficulty: "Intermediate",
        description: "Place 4 balls at 3, 6, 9, and 12 o'clock positions around the hole at 4 feet. Make all four in a row — restart if you miss.",
        focuses: ["Pressure putting", "Reading breaks", "Short-range accuracy"],
      },
      {
        title: "Lag Putting Ladder",
        difficulty: "Advanced",
        description: "Set targets at 20, 30, and 40 feet. Hit 3 balls to each distance, trying to stop every ball within a 3-foot circle. Track your success rate.",
        focuses: ["Distance control", "Speed reading", "Touch"],
      },
    ],
  },
  {
    category: "Short Game",
    drills: [
      {
        title: "Up & Down Challenge",
        difficulty: "Beginner",
        description: "Drop 10 balls around the practice green at various distances (5–20 yards). Try to get up and down on as many as possible.",
        focuses: ["Chip contact", "Landing spot selection", "Scrambling"],
      },
      {
        title: "9-Shot Chip Drill",
        difficulty: "Intermediate",
        description: "Hit 3 chips each with a PW, 9-iron, and 8-iron to the same target. Notice how each club affects trajectory and roll.",
        focuses: ["Club selection", "Trajectory control", "Versatility"],
      },
      {
        title: "Bunker 50% Drill",
        difficulty: "Advanced",
        description: "Hit 20 bunker shots and aim to land at least 10 within 6 feet of the pin. Focus on consistent splash contact and open face technique.",
        focuses: ["Sand contact", "Distance control from sand", "Confidence"],
      },
    ],
  },
  {
    category: "Full Swing",
    drills: [
      {
        title: "Alignment Stick Drill",
        difficulty: "Beginner",
        description: "Place an alignment stick on the ground parallel to your target line. Hit 20 shots focusing on keeping your feet, hips, and shoulders square.",
        focuses: ["Alignment", "Setup routine", "Target awareness"],
      },
      {
        title: "Stock Shot Ladder",
        difficulty: "Intermediate",
        description: "With your 7-iron, hit 5 balls at 75%, 85%, and 100% effort. Track carry distances to learn your true yardages at each swing level.",
        focuses: ["Distance control", "Tempo", "Shot shaping"],
      },
      {
        title: "Pressure 14-Club Test",
        difficulty: "Advanced",
        description: "Hit one shot with every club in your bag to a specific target. Score each on a 1–5 scale for quality. Identify your weakest clubs.",
        focuses: ["Full bag confidence", "Weak spot identification", "Simulated pressure"],
      },
    ],
  },
  {
    category: "Course Management",
    drills: [
      {
        title: "Par 3 Course Simulation",
        difficulty: "Beginner",
        description: "On the range, pick 9 targets at different distances and play them as a par-3 course. Choose a club, commit to a target, and score each 'hole'.",
        focuses: ["Target selection", "Commitment", "Mental routine"],
      },
      {
        title: "Worst Ball Scramble",
        difficulty: "Intermediate",
        description: "Play 9 holes using two balls per shot. Always play the next shot from the worse position. Great for building resilience.",
        focuses: ["Recovery shots", "Decision making", "Mental toughness"],
      },
      {
        title: "18-Hole Strategy Journal",
        difficulty: "Advanced",
        description: "Before your next round, write down your target and club for every tee shot and approach. Compare plan vs. actual decisions after the round.",
        focuses: ["Pre-round planning", "Self-awareness", "Strategic thinking"],
      },
    ],
  },
];

const DrillLibrary = () => {
  return (
    <div className="space-y-6">
      {drillData.map((category) => (
        <div key={category.category}>
          <h2 className="text-lg font-bold text-foreground mb-3">{category.category}</h2>
          <div className="space-y-3">
            {category.drills.map((drill) => (
              <Card key={drill.title}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{drill.title}</CardTitle>
                    <Badge className={difficultyColor[drill.difficulty]}>
                      {drill.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{drill.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {drill.focuses.map((focus) => (
                      <span
                        key={focus}
                        className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DrillLibrary;
