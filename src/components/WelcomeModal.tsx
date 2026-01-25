import { Check, Crown, Lightbulb, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeModal = ({ open, onClose }: WelcomeModalProps) => {
  const { resolvedTheme } = useTheme();
  const navigate = useNavigate();

  const handleSetUpBag = () => {
    onClose();
    navigate('/settings', { state: { openSection: 'my-bag' } });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="items-center pb-2">
          <img 
            src={resolvedTheme === "dark" ? logoLight : logoDark} 
            alt="TRACKD Golf" 
            className="h-16 mb-2"
          />
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to TRACKD Golf!
          </DialogTitle>
          <p className="text-muted-foreground text-center text-sm">
            Thanks for signing up. Here's what you can do:
          </p>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Free Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Check className="w-5 h-5" />
              <span>Free Features</span>
            </div>
            <ul className="ml-7 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Track every round with detailed hole-by-hole stats</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Calculate your Trackd Handicap automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Customize your bag with your clubs</span>
              </li>
            </ul>
          </div>

          {/* Premium Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-accent font-semibold">
              <Crown className="w-5 h-5" />
              <span>Premium Features</span>
            </div>
            <ul className="ml-7 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Unlimited round history</span>
              </li>
              <li className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Advanced club performance analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <Crown className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span>Detailed shot dispersion charts</span>
              </li>
            </ul>
            <p className="ml-7 text-sm font-medium text-accent">
              Start with a 4-week free trial!
            </p>
          </div>

          {/* Quick Tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Lightbulb className="w-5 h-5 text-warning" />
              <span>Quick Tips</span>
            </div>
            <ul className="ml-7 space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>Tap "Start New Round" to begin tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>Record FIR, GIR, putts, and clubs for insights</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning">•</span>
                <span>Check your Stats page after a few rounds</span>
              </li>
            </ul>
          </div>

          {/* Before You Start - Bag Setup */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center gap-2 text-foreground font-semibold mb-2">
              <Settings className="w-5 h-5 text-primary" />
              <span>Before You Start</span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Make sure to set up your bag in Settings with the clubs you actually carry. 
              This ensures accurate club tracking when you record your rounds.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSetUpBag}
              className="w-full"
            >
              <Settings className="w-4 h-4 mr-2" />
              Set Up My Bag
            </Button>
          </div>
        </div>

        <Button 
          onClick={onClose} 
          className="w-full"
          size="lg"
        >
          Get Started
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-3">
          Need more help?{" "}
          <a 
            href="https://www.trackdgolf.com/guide" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Watch our how-to video
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
};
