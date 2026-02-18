import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Trophy, Target, CheckCircle2, Lock, MapPin, Star, Bird, Feather, X, AlertCircle, LucideIcon, RotateCcw, Crosshair, Flag, Crown, EyeOff, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAchievements, TimeRange, Challenge, CHALLENGE_GROUPS, ChallengeGroup } from "@/hooks/useAchievements";
import { useDistancePlayed, getDistanceMilestone, getNextMilestone } from "@/hooks/useDistancePlayed";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GROUP_ICONS: Record<ChallengeGroup, LucideIcon> = {
  rounds: RotateCcw,
  score: Trophy,
  accuracy: Crosshair,
  "short-game": Flag,
  distance: MapPin,
  goat: Crown,
  hidden: EyeOff,
  completionist: Award,
};

// Filter sequential challenges: show completed + next active milestone per sequence, hide the rest
const filterSequentialChallenges = (challenges: Challenge[]): Challenge[] => {
  const sequenceMap = new Map<string, Challenge[]>();
  const nonSequence: Challenge[] = [];

  for (const c of challenges) {
    if (c.sequence) {
      if (!sequenceMap.has(c.sequence)) sequenceMap.set(c.sequence, []);
      sequenceMap.get(c.sequence)!.push(c);
    } else {
      nonSequence.push(c);
    }
  }

  const visible: Challenge[] = [...nonSequence];

  for (const [, seqChallenges] of sequenceMap) {
    seqChallenges.sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
    let foundActive = false;
    for (const c of seqChallenges) {
      if (c.isCompleted) {
        visible.push(c);
      } else if (!foundActive) {
        visible.push(c);
        foundActive = true;
      }
    }
  }

  return visible;
};

const Achievements = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<TimeRange>("MAX");
  const [distanceTimeRange, setDistanceTimeRange] = useState<TimeRange>("MAX");
  const [distanceUnit, setDistanceUnit] = useState<"km" | "miles">("km");
  const [challengeFilter, setChallengeFilter] = useState<"open" | "completed">("open");
  const { data, isLoading } = useAchievements(timeRange);
  const { data: distanceData, isLoading: isDistanceLoading } = useDistancePlayed(distanceTimeRange);
  const timeRanges: TimeRange[] = ["3M", "6M", "1Y", "MAX"];

  const achievementTiles: {
    key: string;
    label: string;
    icon: LucideIcon;
    count: number;
    iconColor: string;
    iconTextColor: string;
  }[] = [
    {
      key: "holesInOne",
      label: "Holes-in-One",
      icon: Star,
      count: data?.stats.holesInOne ?? 0,
      iconColor: "bg-yellow-100 dark:bg-yellow-900/30",
      iconTextColor: "text-yellow-500",
    },
    {
      key: "eagles",
      label: "Eagles",
      icon: Bird,
      count: data?.stats.eagles ?? 0,
      iconColor: "bg-purple-100 dark:bg-purple-900/30",
      iconTextColor: "text-purple-500",
    },
    {
      key: "birdies",
      label: "Birdies",
      icon: Feather,
      count: data?.stats.birdies ?? 0,
      iconColor: "bg-green-100 dark:bg-green-900/30",
      iconTextColor: "text-green-500",
    },
    {
      key: "pars",
      label: "Pars",
      icon: Target,
      count: data?.stats.pars ?? 0,
      iconColor: "bg-blue-100 dark:bg-blue-900/30",
      iconTextColor: "text-blue-500",
    },
    {
      key: "bogeys",
      label: "Bogeys",
      icon: X,
      count: data?.stats.bogeys ?? 0,
      iconColor: "bg-orange-100 dark:bg-orange-900/30",
      iconTextColor: "text-orange-500",
    },
    {
      key: "doubleBogeys",
      label: "Doubles (+)",
      icon: AlertCircle,
      count: data?.stats.doubleBogeys ?? 0,
      iconColor: "bg-red-100 dark:bg-red-900/30",
      iconTextColor: "text-red-500",
    },
  ];

  const getChallengeStatus = (challenge: Challenge) => {
    if (challenge.isCompleted) {
      return {
        icon: <CheckCircle2 className="w-6 h-6 text-green-500" />,
        bgClass: "border-green-500/30 bg-green-500/10",
        statusText: "Completed!",
        statusClass: "text-green-500",
      };
    }
    if (challenge.progress > 0) {
      return {
        icon: <Target className="w-6 h-6 text-orange-500" />,
        bgClass: "border-orange-500/30",
        statusText: `${challenge.progress} / ${challenge.target}`,
        statusClass: "text-orange-500",
      };
    }
    return {
      icon: <Lock className="w-6 h-6 text-muted-foreground" />,
      bgClass: "border-muted bg-muted/50",
      statusText: "",
      statusClass: "text-muted-foreground",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
      <PageHeader height="h-32" />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-header-foreground">Achievements</h1>
            <p className="text-header-foreground/70 text-sm">Track your milestones</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="p-2 text-header-foreground hover:text-header-foreground/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsible Sections */}
        <Accordion type="multiple" defaultValue={["achievements", "challenges", "distance"]} className="space-y-4">
          {/* Achievements Section */}
          <AccordionItem value="achievements" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Score Achievements</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Time Range Selector */}
              <div className="flex gap-2 justify-center mb-4">
                {timeRanges.map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="min-w-[50px]"
                  >
                    {range}
                  </Button>
                ))}
              </div>
              {isLoading ? (
                <div className="grid grid-cols-3 gap-3 pb-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 pb-4">
                  {achievementTiles.map((tile) => {
                    const totalHoles = data?.stats.totalHolesPlayed ?? 0;
                    const pct = totalHoles > 0 ? (tile.count / totalHoles) * 100 : 0;
                    const displayPct = Math.round(pct);
                    return (
                      <Card
                        key={tile.key}
                        className="transition-all hover:scale-[1.02]"
                      >
                        <CardContent className="p-3 text-center relative">
                          <span className="absolute top-1.5 right-1.5 text-[10px] font-medium text-muted-foreground">
                            {displayPct}%
                          </span>
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1", tile.iconColor)}>
                            <tile.icon className={cn("w-5 h-5", tile.iconTextColor)} />
                          </div>
                          <div className="text-xl font-bold text-foreground">
                            {tile.count}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {tile.label}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Distance Played Section */}
          <AccordionItem value="distance" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Distance Played</h2>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {/* Time Range Selector */}
              <div className="flex gap-2 justify-center mb-4">
                {timeRanges.map((range) => (
                  <Button
                    key={range}
                    variant={distanceTimeRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDistanceTimeRange(range)}
                    className="min-w-[50px]"
                  >
                    {range}
                  </Button>
                ))}
              </div>
              
              {isDistanceLoading ? (
                <div className="pb-4">
                  <Skeleton className="h-32 rounded-lg" />
                </div>
              ) : (
                <div className="pb-4 text-center">
                  <div className="text-5xl font-bold text-foreground mb-2">
                    {distanceUnit === "km" 
                      ? distanceData?.totalKm.toFixed(1) 
                      : distanceData?.totalMiles.toFixed(1)}
                  </div>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    <Button
                      variant={distanceUnit === "km" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDistanceUnit("km")}
                    >
                      km
                    </Button>
                    <Button
                      variant={distanceUnit === "miles" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDistanceUnit("miles")}
                    >
                      miles
                    </Button>
                  </div>

                  <div className="flex justify-center gap-6 text-sm text-muted-foreground mb-4">
                    <div>
                      <span className="font-semibold text-foreground">{distanceData?.holesPlayed || 0}</span> holes
                    </div>
                    <div>
                      <span className="font-semibold text-foreground">{distanceData?.roundsPlayed || 0}</span> rounds
                    </div>
                  </div>

                  {distanceData?.totalKm === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Start tracking rounds to see your distance!
                    </p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Challenges Section */}
          <AccordionItem value="challenges" className="border rounded-lg bg-card px-4">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Challenges</h2>
                {!isLoading && data?.challenges && (
                  <span className="text-xs text-muted-foreground font-normal ml-1">
                  {(() => {
                      const completed = data.challenges.filter(c => c.isCompleted).length;
                      return `${completed}/${data.challenges.length}`;
                    })()}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex gap-2 justify-center mb-4">
                <Button
                  variant={challengeFilter === "open" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChallengeFilter("open")}
                >
                  Open
                </Button>
                <Button
                  variant={challengeFilter === "completed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChallengeFilter("completed")}
                >
                  Completed
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-3 pb-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : (
                <Accordion type="multiple" defaultValue={["score"]} className="space-y-2 pb-4">
                  {(() => {
                    // Filter sequences across ALL groups first, then split by group
                    const allVisible = filterSequentialChallenges(data?.challenges || []);
                    const visibleIds = new Set(allVisible.map(c => c.id));
                    return CHALLENGE_GROUPS.map((group) => {
                    const GroupIcon = GROUP_ICONS[group.id];
                    const visibleChallenges = allVisible.filter(c => c.group === group.id);
                    const filteredChallenges = visibleChallenges.filter((c) =>
                      challengeFilter === "open" ? !c.isCompleted : c.isCompleted
                    );

                    return (
                      <AccordionItem key={group.id} value={group.id} className="border rounded-lg px-3">
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-center gap-2">
                            <GroupIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{group.title}</span>
                            <span className="text-xs text-muted-foreground font-normal ml-1">
                              {(() => {
                                const allInGroup = (data?.challenges || []).filter(c => c.group === group.id);
                                const completedInGroup = allInGroup.filter(c => c.isCompleted).length;
                                return `${completedInGroup}/${allInGroup.length}`;
                              })()}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          {group.id === "hidden" && filteredChallenges.length === 0 && challengeFilter === "open" ? (
                            <div className="flex items-center gap-2 py-3 text-muted-foreground text-sm">
                              <Lock className="w-4 h-4" />
                              <span>???</span>
                            </div>
                          ) : filteredChallenges.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-3">No challenges yet</p>
                          ) : (
                            <div className="space-y-2 pb-2">
                              {filteredChallenges.map((challenge) => {
                                const status = getChallengeStatus(challenge);
                                const isHiddenAndLocked = group.id === "hidden" && !challenge.isCompleted;
                                return (
                                  <Card
                                    key={challenge.id}
                                    className={`border ${status.bgClass} transition-all`}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0">{status.icon}</div>
                                        <div className="flex-1 min-w-0">
                                          {isHiddenAndLocked ? (
                                            <p className="text-sm text-muted-foreground italic">Play more golf to unlock</p>
                                          ) : (
                                            <>
                                              <h3 className="font-semibold text-sm">{challenge.title}</h3>
                                              <p className="text-xs text-muted-foreground">
                                                {challenge.description}
                                              </p>
                                            </>
                                          )}
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                          <div className={`text-xs font-medium ${status.statusClass}`}>
                                            {status.statusText}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                   });
                  })()}
                </Accordion>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Empty State */}
        {!isLoading && data?.totalRounds === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Rounds Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking your rounds to see your achievements and challenge progress!
              </p>
              <Button onClick={() => navigate("/round")}>Track a Round</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Achievements;