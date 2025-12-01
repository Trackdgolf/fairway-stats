import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Round = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const course = location.state?.course;

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
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {course.course_name || course.club_name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {course.location?.city}, {course.location?.state}
            </p>
          </div>
        </div>

        {/* Course Info */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Course Details</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holes:</span>
              <span className="text-foreground font-medium">
                {course.holes?.length || 18}
              </span>
            </div>
            {course.holes && course.holes.length > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Par:</span>
                  <span className="text-foreground font-medium">
                    {course.holes.reduce((sum: number, hole: any) => sum + (hole.par || 0), 0)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Holes List */}
        {course.holes && course.holes.length > 0 && (
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground mb-3">Holes</h2>
            {course.holes.map((hole: any) => (
              <Card key={hole.hole_number} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-semibold text-foreground">
                      Hole {hole.hole_number}
                    </span>
                    <div className="text-sm text-muted-foreground mt-1">
                      Par {hole.par} • {hole.length_meters} yards
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Stroke Index</div>
                    <div className="font-semibold text-foreground">{hole.stroke_index}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Round;
