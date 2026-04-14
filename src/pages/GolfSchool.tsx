import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import DrillLibrary from "@/components/DrillLibrary";
import BallFlightLaws from "@/components/BallFlightLaws";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GolfSchool = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader />
      <div className="relative z-10 max-w-md mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-header-foreground">Golf School</h1>
            <p className="text-header-foreground/80 text-sm">Improve your game</p>
          </div>
          <button onClick={() => navigate("/settings")} className="text-header-foreground/80 hover:text-header-foreground">
            <Settings className="w-6 h-6" />
          </button>
        </div>

        <Tabs defaultValue="drills" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="drills">Drill Library</TabsTrigger>
            <TabsTrigger value="ball-flight">Ball Flight Laws</TabsTrigger>
          </TabsList>
          <TabsContent value="drills">
            <DrillLibrary />
          </TabsContent>
          <TabsContent value="ball-flight">
            <BallFlightLaws />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default GolfSchool;
