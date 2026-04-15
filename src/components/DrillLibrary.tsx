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

const drillData: DrillCategory[] = [];

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
