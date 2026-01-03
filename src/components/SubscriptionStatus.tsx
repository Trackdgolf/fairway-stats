import { Crown, RotateCcw, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { PaywallModal } from './PaywallModal';

export const SubscriptionStatus = () => {
  const { isPremium: isDbPremium, loading: dbLoading } = useSubscription();
  const { isPremium: isRcPremium, restore, loading: rcLoading, isNative } = useRevenueCat();
  const [showPaywall, setShowPaywall] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Use RevenueCat status on native, database status on web
  const isPremium = isNative ? isRcPremium : isDbPremium;
  const loading = isNative ? rcLoading : dbLoading;

  const handleRestore = async () => {
    setRestoring(true);
    await restore();
    setRestoring(false);
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Subscription</h2>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isPremium ? 'bg-yellow-500/10' : 'bg-muted'}`}>
              <Crown className={`w-5 h-5 ${isPremium ? 'text-yellow-500' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-foreground">
                  {isPremium ? 'Premium' : 'Free Plan'}
                </p>
                {isPremium && (
                  <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPremium 
                  ? 'Enjoy all premium features' 
                  : 'Upgrade for advanced analytics'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {!isPremium && (
            <Button 
              className="flex-1"
              onClick={() => setShowPaywall(true)}
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade
            </Button>
          )}
          
          {isNative && (
            <Button 
              variant={isPremium ? "default" : "outline"}
              className={isPremium ? "flex-1" : ""}
              onClick={handleRestore}
              disabled={restoring}
            >
              {restoring ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      <PaywallModal open={showPaywall} onOpenChange={setShowPaywall} />
    </>
  );
};
