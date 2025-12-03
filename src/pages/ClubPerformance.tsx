import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FairwayDispersion from "@/components/FairwayDispersion";
import GreenDispersion from "@/components/GreenDispersion";
import { useDispersionStats } from "@/hooks/useDispersionStats";

type TabType = "teeShots" | "approach";

const ClubPerformance = () => {
  const [activeTab, setActiveTab] = useState<TabType>("teeShots");
  const [selectedTeeClub, setSelectedTeeClub] = useState<string>("all");
  const [selectedApproachClub, setSelectedApproachClub] = useState<string>("all");

  const { data: stats, isLoading } = useDispersionStats(selectedTeeClub, selectedApproachClub);

  const teeClubs = ["All Clubs", ...(stats?.teeClubs || [])];
  const approachClubs = ["All Clubs", ...(stats?.approachClubs || [])];

  const clubs = activeTab === "teeShots" ? teeClubs : approachClubs;
  const selectedClub = activeTab === "teeShots" ? selectedTeeClub : selectedApproachClub;
  const setSelectedClub = activeTab === "teeShots" ? setSelectedTeeClub : setSelectedApproachClub;

  const teeDispersion = stats?.teeShots || { total: 0, fwHit: 0, left: 0, right: 0, short: 0 };
  const approachDispersion = stats?.approach || { total: 0, onGreen: 0, long: 0, left: 0, right: 0, short: 0 };

  const shotCount = activeTab === "teeShots" ? teeDispersion.total : approachDispersion.total;
  const shotType = activeTab === "teeShots" ? "tee shots" : "approach shots";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Club Performance</h1>
          <p className="text-muted-foreground">Shot dispersion analysis</p>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teeShots">Tee Shots</TabsTrigger>
            <TabsTrigger value="approach">Approach</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Shot Count */}
        <p className="text-sm text-muted-foreground text-center mb-4">
          {isLoading ? "Loading..." : shotCount > 0 ? `Based on ${shotCount} ${shotType}` : `No ${shotType} recorded yet`}
        </p>

        {/* Club Filter */}
        <ScrollArea className="w-full whitespace-nowrap mb-6">
          <div className="flex gap-2 pb-2">
            {clubs.map((club) => {
              const clubKey = club === "All Clubs" ? "all" : club;
              return (
                <Button
                  key={club}
                  variant={selectedClub === clubKey ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedClub(clubKey)}
                  className="flex-shrink-0"
                >
                  {club}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Dispersion Graphic */}
        <div className="bg-card rounded-xl p-4 shadow-sm">
          {activeTab === "teeShots" ? (
            <FairwayDispersion
              fwHit={teeDispersion.fwHit}
              left={teeDispersion.left}
              right={teeDispersion.right}
              short={teeDispersion.short}
            />
          ) : (
            <GreenDispersion
              onGreen={approachDispersion.onGreen}
              long={approachDispersion.long}
              left={approachDispersion.left}
              right={approachDispersion.right}
              short={approachDispersion.short}
            />
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ClubPerformance;
