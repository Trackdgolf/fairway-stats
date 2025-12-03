import { Progress } from "@/components/ui/progress";

interface ClubStats {
  club: string;
  attempts: number;
  successes: number;
  successRate: number;
}

interface ScrambleClubListProps {
  clubs: ClubStats[];
}

const getRankDisplay = (rank: number) => {
  switch (rank) {
    case 1: return "🥇";
    case 2: return "🥈";
    case 3: return "🥉";
    default: return `#${rank}`;
  }
};

const ScrambleClubList = ({ clubs }: ScrambleClubListProps) => {
  if (clubs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No scramble data recorded yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Start tracking your up-and-downs during rounds!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clubs.map((club, index) => (
        <div
          key={club.club}
          className="bg-card rounded-xl p-4 shadow-sm border border-border"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-lg min-w-[2rem]">{getRankDisplay(index + 1)}</span>
              <span className="font-semibold text-foreground">{club.club}</span>
            </div>
            <span className="text-lg font-bold text-primary">{club.successRate}%</span>
          </div>
          <Progress value={club.successRate} className="h-2 mb-2" />
          <p className="text-sm text-muted-foreground">
            {club.successes} saves from {club.attempts} attempts
          </p>
        </div>
      ))}
    </div>
  );
};

export default ScrambleClubList;
