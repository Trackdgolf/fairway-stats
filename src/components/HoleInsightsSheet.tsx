import { useState } from "react";
import { ChevronLeft, ChevronRight, Crown, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePremiumStatus } from "@/hooks/usePremiumStatus";
import { PaywallModal } from "@/components/PaywallModal";
import HoleInsightsContent from "@/components/HoleInsightsContent";

interface HoleInsightsSheetProps {
  courseId: string | null | undefined;
  holeNumber: number | null | undefined;
  par: number | null | undefined;
}

const HoleInsightsSheet = ({ courseId, holeNumber, par }: HoleInsightsSheetProps) => {
  const [open, setOpen] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { isPremium } = usePremiumStatus();

  // Hide trigger if we don't have enough info to render insights
  if (!courseId || !holeNumber || !par) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            aria-label="View hole insights"
            className="fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-primary text-primary-foreground rounded-l-lg shadow-lg px-1.5 py-3 flex flex-col items-center gap-1 active:opacity-90"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[11px] font-semibold tracking-wide [writing-mode:vertical-rl] rotate-180">
              INSIGHTS
            </span>
          </button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
            <SheetClose asChild>
              <button
                aria-label="Close insights"
                className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-muted-foreground transition-colors -ml-1 px-1 py-1"
              >
                <ChevronRight className="w-5 h-5" />
                <span>Back</span>
              </button>
            </SheetClose>
            <div className="flex-1 min-w-0 text-center">
              <h2 className="text-base font-semibold text-foreground leading-tight">
                Hole {holeNumber} · Par {par}
              </h2>
              <p className="text-[11px] text-muted-foreground leading-tight">Your history at this hole</p>
            </div>
            <SheetClose asChild>
              <button
                aria-label="Close insights"
                className="p-1.5 rounded-md text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </SheetClose>
          </div>

          <div className="px-6 py-4">
            {isPremium ? (
              <HoleInsightsContent courseId={courseId} holeNumber={holeNumber} par={par} />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Crown className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-base font-bold mb-2">Premium Feature</h3>
                  <p className="text-muted-foreground text-sm mb-5">
                    Unlock hole-specific insights — see where you typically miss off the tee and your
                    best up-and-down spots — while you play.
                  </p>
                  <Button onClick={() => setShowPaywall(true)} className="w-full">
                    View Premium Options
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  );
};

export default HoleInsightsSheet;
