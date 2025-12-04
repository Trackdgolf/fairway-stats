import { useState } from "react";
import { Search, MapPin, ArrowLeft, Clock } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface CourseLocation {
  city: string;
  state: string;
  country: string;
}

interface Course {
  id: number;
  club_name: string;
  course_name: string;
  location: CourseLocation;
}

interface RecentCourse {
  course_id: string;
  course_name: string;
  played_at: string;
}

const CourseSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch recently played courses
  const { data: recentCourses = [] } = useQuery({
    queryKey: ['recent-courses', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('rounds')
        .select('course_id, course_name, played_at')
        .eq('user_id', user.id)
        .not('course_id', 'is', null)
        .order('played_at', { ascending: false });

      if (error) throw error;

      // Get unique courses by course_id, keeping the most recent
      const uniqueCourses = data.reduce((acc: RecentCourse[], round) => {
        if (round.course_id && !acc.find(c => c.course_id === round.course_id)) {
          acc.push({
            course_id: round.course_id,
            course_name: round.course_name,
            played_at: round.played_at || '',
          });
        }
        return acc;
      }, []);

      return uniqueCourses.slice(0, 5); // Return top 5 recent courses
    },
    enabled: !!user?.id,
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-courses', {
        body: { query: searchQuery },
      });

      if (error) throw error;

      setCourses(data.courses || []);
      
      if (!data.courses || data.courses.length === 0) {
        toast({
          title: "No courses found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search for courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCourse = async (course: Course) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-course-details', {
        body: { courseId: course.id },
      });

      if (error) throw error;

      const courseData = data.course;
      const holes = courseData.tees?.male?.[0]?.holes || [];
      
      const mappedCourse = {
        ...courseData,
        holes: holes.map((hole: any, index: number) => ({
          hole_number: index + 1,
          par: hole.par,
          length_meters: hole.yardage,
          stroke_index: hole.handicap,
        })),
      };

      navigate('/round', { state: { course: mappedCourse } });
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: "Failed to load course",
        description: "Could not load course details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSelectRecentCourse = async (courseId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('get-course-details', {
        body: { courseId: parseInt(courseId) },
      });

      if (error) throw error;

      const courseData = data.course;
      const holes = courseData.tees?.male?.[0]?.holes || [];
      
      const mappedCourse = {
        ...courseData,
        holes: holes.map((hole: any, index: number) => ({
          hole_number: index + 1,
          par: hole.par,
          length_meters: hole.yardage,
          stroke_index: hole.handicap,
        })),
      };

      navigate('/round', { state: { course: mappedCourse } });
    } catch (error) {
      console.error('Error fetching course details:', error);
      toast({
        title: "Failed to load course",
        description: "Could not load course details. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20 relative">
      <PageHeader />
      <div className="max-w-md mx-auto px-4 pt-20 relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-header-foreground hover:text-header-foreground/70 hover:bg-header-foreground/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-header-foreground">Find Course</h1>
        </div>

        {/* Recently Played Section */}
        {recentCourses.length > 0 && courses.length === 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-muted-foreground">Recently Played</h2>
            </div>
            <div className="space-y-2">
              {recentCourses.map((course) => (
                <Card
                  key={course.course_id}
                  className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleSelectRecentCourse(course.course_id)}
                >
                  <h3 className="font-medium text-foreground">
                    {course.course_name}
                  </h3>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for a golf course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => handleSelectCourse(course)}
            >
              <h3 className="font-semibold text-foreground mb-1">
                {course.course_name || course.club_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  {course.location.city}, {course.location.state}, {course.location.country}
                </span>
              </div>
            </Card>
          ))}
        </div>

        {courses.length === 0 && !isLoading && recentCourses.length === 0 && (
          <Card className="p-8 text-center">
            <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              Search for a golf course to start your round
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CourseSearch;
