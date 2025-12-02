import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import FairwayDispersion from "@/components/FairwayDispersion";
import GreenDispersion from "@/components/GreenDispersion";

type TabType = "teeShots" | "approach";

const ClubPerformance = () => {
  const [activeTab, setActiveTab] = useState<TabType>("teeShots");
  const [selectedClub, setSelectedClub] = useState<string>("all");

  // Mock clubs used - would come from actual round data
  const teeClubs = ["All Clubs", "Driver", "3 Wood", "5 Iron"];
  const approachClubs = ["All Clubs", "5 Iron", "6 Iron", "7 Iron", "8 Iron", "9 Iron", "PW", "SW"];

  const clubs = activeTab === "teeShots" ? teeClubs : approachClubs;

  // Mock dispersion data - would be calculated from actual round data
  const teeDispersion = {
    total: 27,
    fwHit: 37,
    left: 37,
    right: 26,
    short: 0,
  };

  const approachDispersion = {
    total: 35,
    onGreen: 34,
    long: 3,
    left: 6,
    right: 6,
    short: 51,
  };

  const shotCount = activeTab === "teeShots" ? teeDispersion.total : approachDispersion.total;
  const shotType = activeTab === "teeShots" ? "tee shots" : "approach shots";

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary pb-20">
      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Club Performance</h1>
            <p className="text-muted-foreground">Shot dispersion analysis</p>
          </div>
          <ThemeToggle />
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
          Based on {shotCount} {shotType}
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
