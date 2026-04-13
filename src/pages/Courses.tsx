import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, ChevronLeft, ArrowUpDown, Info, Settings, Crown, ChevronRight } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoursePerformance, type CoursePerformance } from "@/hooks/useCoursePerformance";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PaywallModal } from "@/components/PaywallModal";
import HoleDetail from "@/components/HoleDetail";

const getOverParColor = (val: number, min: number, max: number) => {
  if (min === max) return "text-yellow-500";
  const pct = (val - min) / (max - min);
  if (pct <= 0.2) return "text-green-500";
  if (pct <= 0.4) return "text-yellow-500";
  if (pct <= 0.6) return "text-orange-400";
  if (pct <= 0.8) return "text-orange-500";
  return "text-red-500";
};

const formatOverPar = (val: number) => {
  if (val > 0) return `+${val.toFixed(1)}`;
  if (val === 0) return "E";
  return val.toFixed(1);
};

const getCourseNameClass = (name: string) => {
  if (name.length > 35) return "text-lg";
  if (name.length > 25) return "text-xl";
  if (name.length > 18) return "text-2xl";
  return "text-3xl";
};

const Courses = () => {
  const navigate = useNavigate();
  const { data: courses, isLoading } = useCoursePerformance();
  const [selectedCourse, setSelectedCourse] = useState<CoursePerformance | null>(null);
  const [selectedHole, setSelectedHole] = useState<number | null>(null);
  const [sortByDifficulty, setSortByDifficulty] = useState(false);
  const { isPremium, status } = usePremiumStatus();
  const [showPaywall, setShowPaywall] = useState(false);

  // If not premium and not loading, show locked state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
        <PageHeader />
        <div className="max-w-md mx-auto px-4 pt-8 flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
        <PageHeader />
        <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-header-foreground mb-2">Courses</h1>
            <p className="text-header-foreground/80">Your personal hole difficulty rankings</p>
          </div>
        </div>

        {/* Premium Overlay - matches Club Performance design */}
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Course analytics require a premium subscription
              </p>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => setShowPaywall(true)}
              >
                <Crown className="w-4 h-4 mr-2" />
                View Premium Options
              </Button>
            </CardContent>
          </Card>
        </div>

        <BottomNav />
        <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
      </div>
    );
  }

  const sortedHoles = selectedCourse
    ? [...selectedCourse.holes].sort((a, b) =>
        sortByDifficulty ? a.personalStrokeIndex - b.personalStrokeIndex : a.holeNumber - b.holeNumber
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-24 relative" style={{ paddingBottom: 'calc(6rem + var(--safe-area-inset-bottom, 0px))' }}>
      <PageHeader />
      <div className="max-w-md mx-auto px-4 pt-8 relative z-10">
        {/* Header */}
        <div className="mb-6 relative">
          <button
            onClick={() => navigate('/settings')}
            className="absolute right-0 top-0 p-2 text-header-foreground hover:text-header-foreground/70 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
           {selectedHole !== null && selectedCourse ? (
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => setSelectedHole(null)} className="text-header-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <h1 className="text-2xl font-bold text-header-foreground">{selectedCourse.courseName}</h1>
              </div>
            ) : selectedCourse ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => { setSelectedCourse(null); setSelectedHole(null); }} className="text-header-foreground">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className={`${getCourseNameClass(selectedCourse.courseName)} font-bold text-header-foreground`}>{selectedCourse.courseName}</h1>
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-header-foreground mb-2">Courses</h1>
              <p className="text-header-foreground/80">Your personal hole difficulty rankings</p>
            </>
          )}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : selectedHole !== null && selectedCourse ? (
          <HoleDetail
            courseId={selectedCourse.courseId}
            courseName={selectedCourse.courseName}
            hole={selectedCourse.holes.find(h => h.holeNumber === selectedHole)!}
            onBack={() => setSelectedHole(null)}
          />
        ) : selectedCourse ? (
          /* Detail View */
          <div className="space-y-4">
            {/* Front 9 vs Back 9 Summary */}
            {(() => {
              const holeMin = Math.min(...selectedCourse.holes.map(h => h.avgOverPar));
              const holeMax = Math.max(...selectedCourse.holes.map(h => h.avgOverPar));
              const front9 = selectedCourse.holes.filter(h => h.holeNumber <= 9);
              const back9 = selectedCourse.holes.filter(h => h.holeNumber > 9);
              const front9Avg = front9.length > 0 ? front9.reduce((sum, h) => sum + h.avgOverPar, 0) / front9.length : 0;
              const back9Avg = back9.length > 0 ? back9.reduce((sum, h) => sum + h.avgOverPar, 0) / back9.length : 0;
              const front9Total = front9.reduce((sum, h) => sum + h.avgOverPar, 0);
              const back9Total = back9.reduce((sum, h) => sum + h.avgOverPar, 0);

              const parGroups = [3, 4, 5]
                .map(par => {
                  const holes = selectedCourse.holes.filter(h => h.par === par);
                  if (holes.length === 0) return null;
                  const total = holes.reduce((sum, h) => sum + h.avgOverPar, 0);
                  const avg = total / holes.length;
                  return { par, holes, total, avg };
                })
                .filter(Boolean) as { par: number; holes: any[]; total: number; avg: number }[];

              const hasFrontBack = front9.length > 0 && back9.length > 0;

              return (hasFrontBack || parGroups.length > 0) ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Avg Performance vs Par</p>
                    {hasFrontBack && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground mb-1">Front 9</p>
                          <p className={`text-2xl font-bold ${getOverParColor(front9Avg, holeMin, holeMax)}`}>
                            {formatOverPar(Number(front9Total.toFixed(1)))}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatOverPar(Number(front9Avg.toFixed(1)))} per hole
                          </p>
                        </div>
                        <div className="text-center border-l border-border">
                          <p className="text-xs text-muted-foreground mb-1">Back 9</p>
                          <p className={`text-2xl font-bold ${getOverParColor(back9Avg, holeMin, holeMax)}`}>
                            {formatOverPar(Number(back9Total.toFixed(1)))}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatOverPar(Number(back9Avg.toFixed(1)))} per hole
                          </p>
                        </div>
                      </div>
                    )}
                    {parGroups.length > 0 && (
                      <>
                        {hasFrontBack && <div className="border-t border-border my-4" />}
                        <div className={`grid gap-4 ${parGroups.length === 3 ? 'grid-cols-3' : parGroups.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                          {parGroups.map((group, i) => (
                            <div key={group.par} className={`text-center ${i > 0 ? 'border-l border-border' : ''}`}>
                              <p className="text-xs text-muted-foreground mb-1">Par {group.par}s</p>
                              <p className={`text-2xl font-bold ${getOverParColor(group.avg, holeMin, holeMax)}`}>
                                {formatOverPar(Number(group.total.toFixed(1)))}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatOverPar(Number(group.avg.toFixed(1)))} per hole
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : null;
            })()}

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Based on {selectedCourse.roundCount} rounds
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortByDifficulty(!sortByDifficulty)}
                className="gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortByDifficulty ? "By Hole" : "By Difficulty"}
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">Hole</TableHead>
                      <TableHead className="w-14 text-center">Par</TableHead>
                      <TableHead className="w-14 text-center">Avg</TableHead>
                      <TableHead className="w-14 text-center">+/-</TableHead>
                      <TableHead className="w-14 text-center">SI</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const holeMin = Math.min(...selectedCourse.holes.map(h => h.avgOverPar));
                      const holeMax = Math.max(...selectedCourse.holes.map(h => h.avgOverPar));
                      return sortedHoles.map((hole) => (
                      <TableRow key={hole.holeNumber} className="cursor-pointer active:bg-muted/50" onClick={() => setSelectedHole(hole.holeNumber)}>
                        <TableCell className="font-medium">{hole.holeNumber}</TableCell>
                        <TableCell className="text-center">{hole.par}</TableCell>
                        <TableCell className="text-center">{hole.avgScore.toFixed(1)}</TableCell>
                        <TableCell className={`text-center font-semibold ${getOverParColor(hole.avgOverPar, holeMin, holeMax)}`}>
                          {formatOverPar(hole.avgOverPar)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="w-7 h-7 rounded-full flex items-center justify-center p-0 text-xs">
                            {hole.personalStrokeIndex}
                          </Badge>
                        </TableCell>
                        <TableCell className="p-0 pr-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ));
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-4 flex gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Personal Stroke Index (SI)</p>
                  <p>
                    Your personal SI ranks holes from hardest (SI 1) to easiest (SI 18) based on your
                    average score relative to par. This helps you identify which holes to focus on to
                    lower your scores.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : courses?.length ? (
          /* Course List View */
          <div className="space-y-3">
            {courses.map((course) => (
              <Card
                key={course.courseId}
                className="cursor-pointer active:opacity-80"
                onClick={() => {
                  setSelectedCourse(course);
                  setSortByDifficulty(false);
                }}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{course.courseName}</p>
                    <p className="text-sm text-muted-foreground">{course.roundCount} rounds played</p>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground rotate-180" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Play a round to start seeing your personal hole difficulty rankings. The more rounds you play, the more accurate your data becomes.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};

export default Courses;
