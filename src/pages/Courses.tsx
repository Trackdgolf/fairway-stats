import { useState } from "react";
import { MapPin, ChevronLeft, ArrowUpDown, Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCoursePerformance, type CoursePerformance } from "@/hooks/useCoursePerformance";

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
  const { data: courses, isLoading } = useCoursePerformance();
  const [selectedCourse, setSelectedCourse] = useState<CoursePerformance | null>(null);
  const [sortByDifficulty, setSortByDifficulty] = useState(false);

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
          {selectedCourse ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedCourse(null)} className="text-header-foreground">
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

              return front9.length > 0 && back9.length > 0 ? (
                <Card>
                  <CardContent className="p-4">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Avg Performance vs Par</p>
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      const holeMin = Math.min(...selectedCourse.holes.map(h => h.avgOverPar));
                      const holeMax = Math.max(...selectedCourse.holes.map(h => h.avgOverPar));
                      return sortedHoles.map((hole) => (
                      <TableRow key={hole.holeNumber}>
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
                Play the same course at least 3 times to see your personal hole difficulty rankings.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Courses;
