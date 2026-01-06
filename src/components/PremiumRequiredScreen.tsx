import { useState } from 'react';
import { Crown, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PaywallModal } from '@/components/PaywallModal';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';

const PREMIUM_BENEFITS = [
  'Detailed club performance analytics',
  'Tee shot dispersion visualization',
  'Approach shot accuracy tracking',
  'Scramble success rates by club',
  'Shot type breakdown (pitch, chip, bunker)',
  'Filter stats by individual clubs',
];

interface PremiumRequiredScreenProps {
  title?: string;
}

export const PremiumRequiredScreen = ({ title = "Club Performance" }: PremiumRequiredScreenProps) => {
  const [showPaywall, setShowPaywall] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const { restore } = useRevenueCat();

  const handleRestore = async () => {
    setRestoring(true);
    console.log('Restore purchases: initiated');
    const success = await restore();
    console.log('Restore purchases:', success ? 'success' : 'fail');
    setRestoring(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-20">
      <PageHeader />

      <div className="flex-1 flex items-center justify-center p-6 pt-24">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-xl font-bold mb-2">Premium Feature</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Unlock advanced club analytics to improve your game
            </p>

            <div className="text-left space-y-3 mb-6">
              {PREMIUM_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => {
                  console.log('Paywall opened');
                  setShowPaywall(true);
                }}
              >
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Premium
              </Button>
              
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleRestore}
                disabled={restoring}
              >
                {restoring && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Restore Purchases
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </div>
  );
};
