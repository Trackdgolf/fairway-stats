import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import FairwayDispersion from "@/components/FairwayDispersion";
import GreenDispersion from "@/components/GreenDispersion";
import ScrambleClubList from "@/components/ScrambleClubList";
import { useDispersionStats } from "@/hooks/useDispersionStats";
import { useUserPreferences } from "@/hooks/useUserPreferences";

type TabType = "teeShots" | "approach" | "scramble";
type ScrambleShotTypeFilter = "all" | "pitch" | "chip" | "bunker";

const SCRAMBLE_SHOT_TYPES: { value: ScrambleShotTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pitch", label: "Pitch" },
  { value: "chip", label: "Chip" },
  { value: "bunker", label: "Bunker" },
];

const ClubPerformance = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("teeShots");
  const [selectedTeeClub, setSelectedTeeClub] = useState<string>("all");
  const [selectedApproachClub, setSelectedApproachClub] = useState<string>("all");
  const [selectedScrambleShotType, setSelectedScrambleShotType] = useState<ScrambleShotTypeFilter>("all");

  const { clubs: bagClubs } = useUserPreferences();
  const { data: stats, isLoading } = useDispersionStats(selectedTeeClub, selectedApproachClub, selectedScrambleShotType);

  // Sort clubs by bag order, only include clubs with data
  const sortedTeeClubs = useMemo(() => {
    const clubsWithData = stats?.teeClubs || [];
    const bagOrder = bagClubs.map(c => c.name);
    return clubsWithData.sort((a, b) => {
      const indexA = bagOrder.indexOf(a);
      const indexB = bagOrder.indexOf(b);
      // If not in bag, put at end
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [stats?.teeClubs, bagClubs]);

  const sortedApproachClubs = useMemo(() => {
    const clubsWithData = stats?.approachClubs || [];
    const bagOrder = bagClubs.map(c => c.name);
    return clubsWithData.sort((a, b) => {
      const indexA = bagOrder.indexOf(a);
      const indexB = bagOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return 0;
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });
  }, [stats?.approachClubs, bagClubs]);

  const clubs = activeTab === "teeShots" ? sortedTeeClubs : activeTab === "approach" ? sortedApproachClubs : [];
  const selectedClub = activeTab === "teeShots" ? selectedTeeClub : selectedApproachClub;
  const setSelectedClub = activeTab === "teeShots" ? setSelectedTeeClub : setSelectedApproachClub;

  const teeDispersion = stats?.teeShots || { total: 0, fwHit: 0, left: 0, right: 0, short: 0 };
  const approachDispersion = stats?.approach || { total: 0, onGreen: 0, long: 0, left: 0, right: 0, short: 0 };
  const scrambleStats = stats?.scramble || { total: 0, clubs: [] };

  const getShotInfo = () => {
    if (activeTab === "teeShots") return { count: teeDispersion.total, type: "tee shots" };
    if (activeTab === "approach") return { count: approachDispersion.total, type: "approach shots" };
    return { count: scrambleStats.total, type: "scramble attempts" };
  };
  const { count: shotCount, type: shotType } = getShotInfo();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20 relative">
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
          <h1 className="text-3xl font-bold text-header-foreground mb-2">Club Performance</h1>
          <p className="text-header-foreground/80">Track your dispersion and accuracy</p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="mb-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="teeShots">Tee Shots</TabsTrigger>
            <TabsTrigger value="approach">Approach</TabsTrigger>
            <TabsTrigger value="scramble">Scramble</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Shot Count */}
        <p className="text-sm text-muted-foreground text-center mb-4">
          {isLoading ? "Loading..." : shotCount > 0 ? `Based on ${shotCount} ${shotType}` : `No ${shotType} recorded yet`}
        </p>

        {/* Club Filter - only show for teeShots and approach */}
        {activeTab !== "scramble" && (
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedClub === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClub("all")}
            >
              All Clubs
            </Button>
            
            <Select
              value={selectedClub === "all" ? "" : selectedClub}
              onValueChange={(value) => setSelectedClub(value)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Club Filter" />
              </SelectTrigger>
              <SelectContent>
                {clubs.map((club) => (
                  <SelectItem key={club} value={club}>
                    {club}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Scramble Shot Type Filter */}
        {activeTab === "scramble" && (
          <ScrollArea className="w-full whitespace-nowrap mb-6">
            <div className="flex gap-2 pb-2">
              {SCRAMBLE_SHOT_TYPES.map((type) => (
                <Button
                  key={type.value}
                  variant={selectedScrambleShotType === type.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedScrambleShotType(type.value)}
                  className="flex-shrink-0"
                >
                  {type.label}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}

        {/* Content */}
        {activeTab === "teeShots" && (
          <div className="bg-card rounded-xl p-4 shadow-sm">
            <FairwayDispersion
              fwHit={teeDispersion.fwHit}
              left={teeDispersion.left}
              right={teeDispersion.right}
              short={teeDispersion.short}
            />
          </div>
        )}

        {activeTab === "approach" && (
          <div className="bg-card rounded-xl p-4 shadow-sm">
            <GreenDispersion
              onGreen={approachDispersion.onGreen}
              long={approachDispersion.long}
              left={approachDispersion.left}
              right={approachDispersion.right}
              short={approachDispersion.short}
            />
          </div>
        )}

        {activeTab === "scramble" && (
          <ScrambleClubList clubs={scrambleStats.clubs} />
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ClubPerformance;
