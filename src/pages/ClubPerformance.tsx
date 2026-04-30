import { useState, useMemo } from "react";
import type { TimeRange } from "@/hooks/useRoundStats";
import { useNavigate } from "react-router-dom";
import { Settings, Crown, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import FairwayDispersion from "@/components/FairwayDispersion";
import GreenDispersion from "@/components/GreenDispersion";
import ScrambleClubList from "@/components/ScrambleClubList";
import ClubDistances from "@/components/ClubDistances";
import PuttingPerformance from "@/components/PuttingPerformance";
import { PaywallModal } from "@/components/PaywallModal";
import { useDispersionStats } from "@/hooks/useDispersionStats";
import { usePuttingStats } from "@/hooks/usePuttingStats";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";

type TopView = "dispersion" | "distances";
type TabType = "teeShots" | "approach" | "scramble" | "putting";
type ScrambleShotTypeFilter = "all" | "pitch" | "chip" | "bunker";

const SCRAMBLE_SHOT_TYPES: { value: ScrambleShotTypeFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pitch", label: "Pitch" },
  { value: "chip", label: "Chip" },
  { value: "bunker", label: "Bunker" },
];

const ClubPerformance = () => {
  const navigate = useNavigate();
  const { status } = usePremiumStatus();
  const [activeTab, setActiveTab] = useState<TabType>("teeShots");
  const [topView, setTopView] = useState<TopView>("dispersion");
  const [selectedTeeClub, setSelectedTeeClub] = useState<string>("all");
  const [selectedApproachClub, setSelectedApproachClub] = useState<string>("all");
  const [selectedScrambleShotType, setSelectedScrambleShotType] = useState<ScrambleShotTypeFilter>("all");
  const [timeRange, setTimeRange] = useState<TimeRange>("MAX");
  const [showPaywall, setShowPaywall] = useState(false);

  const { clubs: bagClubs, stockYardages, updateStockYardage } = useUserPreferences();
  const { data: stats, isLoading } = useDispersionStats(selectedTeeClub, selectedApproachClub, selectedScrambleShotType, timeRange);
  const { data: puttingStats, isLoading: puttingLoading } = usePuttingStats(timeRange);

  // Sort clubs by bag order, only include clubs with data - MUST be before early returns
  const sortedTeeClubs = useMemo(() => {
    const clubsWithData = stats?.teeClubs || [];
    const bagOrder = bagClubs.map(c => c.name);
    return clubsWithData.sort((a, b) => {
      const indexA = bagOrder.indexOf(a);
      const indexB = bagOrder.indexOf(b);
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

  // Show loading state while checking premium status
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  const clubs = activeTab === "teeShots" ? sortedTeeClubs : activeTab === "approach" ? sortedApproachClubs : [];
  const selectedClub = activeTab === "teeShots" ? selectedTeeClub : selectedApproachClub;
  const setSelectedClub = activeTab === "teeShots" ? setSelectedTeeClub : setSelectedApproachClub;

  const teeDispersion = stats?.teeShots || { total: 0, fwHit: 0, left: 0, right: 0, short: 0, penalty: 0 };
  const approachDispersion = stats?.approach || { total: 0, onGreen: 0, long: 0, left: 0, right: 0, short: 0 };
  const scrambleStats = stats?.scramble || { total: 0, clubs: [] };

  const getShotInfo = () => {
    if (activeTab === "teeShots") return { count: teeDispersion.total, type: "tee shots" };
    if (activeTab === "approach") return { count: approachDispersion.total, type: "approach shots" };
    if (activeTab === "putting") return { count: puttingStats?.total || 0, type: "putts" };
    return { count: scrambleStats.total, type: "scramble attempts" };
  };
  const { count: shotCount, type: shotType } = getShotInfo();

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
          <h1 className="text-3xl font-bold text-header-foreground mb-2">Club Performance</h1>
          <p className="text-header-foreground/80">Track your dispersion and accuracy</p>
        </div>

        {/* Top-level View Toggle */}
        <ToggleGroup
          type="single"
          value={topView}
          onValueChange={(v) => v && setTopView(v as TopView)}
          className="mb-4 w-full bg-muted rounded-lg p-1"
        >
          <ToggleGroupItem value="dispersion" className="flex-1 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-sm font-medium">
            Dispersion
          </ToggleGroupItem>
          <ToggleGroupItem value="distances" className="flex-1 rounded-md data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm text-sm font-medium">
            Distances
          </ToggleGroupItem>
        </ToggleGroup>

        {topView === "dispersion" && (
          <>
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

            {/* Club Filter + Time Range - for teeShots and approach */}
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

                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as TimeRange)}
                >
                  <SelectTrigger className="w-[120px] h-9 ml-auto">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["LAST", "3M", "6M", "1Y", "MAX"] as TimeRange[]).map((range) => (
                      <SelectItem key={range} value={range}>
                        {range === "LAST" ? "Last Round" : range === "MAX" ? "All Time" : range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Scramble Shot Type Filter + Time Range */}
            {activeTab === "scramble" && (
              <div className="flex gap-1.5 mb-6">
                {SCRAMBLE_SHOT_TYPES.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedScrambleShotType === type.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedScrambleShotType(type.value)}
                  >
                    {type.label}
                  </Button>
                ))}

                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value as TimeRange)}
                >
                  <SelectTrigger className="w-[100px] h-9 ml-auto">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["LAST", "3M", "6M", "1Y", "MAX"] as TimeRange[]).map((range) => (
                      <SelectItem key={range} value={range}>
                        {range === "LAST" ? "Last Round" : range === "MAX" ? "All Time" : range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Content */}
            {activeTab === "teeShots" && (
              <div className="bg-card rounded-xl p-4 shadow-sm">
                <FairwayDispersion
                  fwHit={teeDispersion.fwHit}
                  left={teeDispersion.left}
                  right={teeDispersion.right}
                  short={teeDispersion.short}
                  penalty={teeDispersion.penalty}
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
          </>
        )}

        {topView === "distances" && (
          <ClubDistances
            clubs={bagClubs}
            stockYardages={stockYardages}
            onUpdateYardage={updateStockYardage}
          />
        )}
      </div>

      {/* Premium Overlay - only show when status is definitively 'inactive' */}
      {status === 'inactive' && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Crown className="w-8 h-8 text-primary" />
              </div>
              
              <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Club Performance analytics require a premium subscription
              </p>

              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  console.log('Paywall opened');
                  setShowPaywall(true);
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                View Premium Options
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <BottomNav />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};

export default ClubPerformance;
