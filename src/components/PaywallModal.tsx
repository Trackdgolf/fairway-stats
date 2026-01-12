import { useState, useEffect } from 'react';
import { Crown, Check, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import type { PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface PaywallModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PREMIUM_FEATURES = [
  'Unlimited round history',
  'Advanced club performance analytics',
  'Detailed shot dispersion charts',
  'Export your stats',
  'Priority support',
];

const PRIVACY_POLICY_URL = 'https://www.trackdgolf.com/privacy-policy.pdf';
const TERMS_OF_USE_URL = 'https://www.trackdgolf.com/terms-of-use.pdf';

const getPackageLabel = (packageType: string): string => {
  switch (packageType) {
    case 'ANNUAL':
      return 'Annual';
    case 'MONTHLY':
      return 'Monthly';
    case 'WEEKLY':
      return 'Weekly';
    case 'LIFETIME':
      return 'Lifetime';
    default:
      return packageType;
  }
};

const getPackageDuration = (packageType: string): string => {
  switch (packageType) {
    case 'ANNUAL':
      return '/year';
    case 'MONTHLY':
      return '/month';
    case 'WEEKLY':
      return '/week';
    case 'LIFETIME':
      return ' (one-time)';
    default:
      return '';
  }
};

export const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const { offerings, purchase, restore, loading, isNative } = useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async (pkg: PurchasesPackage) => {
    console.log('Paywall: Purchase initiated for', pkg.identifier);
    setPurchasing(true);
    const success = await purchase(pkg);
    console.log('Paywall: Purchase', success ? 'success' : 'cancelled/failed');
    setPurchasing(false);
    if (success) {
      onOpenChange(false);
    }
  };

  const handleRestore = async () => {
    console.log('Paywall: Restore purchases initiated');
    setRestoring(true);
    const success = await restore();
    console.log('Paywall: Restore', success ? 'success' : 'fail');
    setRestoring(false);
    if (success) {
      onOpenChange(false);
    }
  };

  // Get the current offering's available packages
  const availablePackages = offerings?.current?.availablePackages || [];

  // Log package availability status for debugging
  useEffect(() => {
    if (!isNative) {
      console.log('Paywall: Not on native platform, packages unavailable');
      return;
    }
    
    if (loading) {
      console.log('Paywall: Loading offerings from RevenueCat...');
      return;
    }
    
    if (!offerings) {
      console.log('Paywall: Offerings is null - RevenueCat may not be initialized or configured');
      return;
    }
    
    if (!offerings.current) {
      console.log('Paywall: No current offering configured in RevenueCat dashboard');
      return;
    }
    
    if (availablePackages.length === 0) {
      console.log('Paywall: Current offering has no packages - check RevenueCat product configuration');
      return;
    }
    
    console.log('Paywall: Packages loaded successfully', {
      offeringId: offerings.current.identifier,
      packageCount: availablePackages.length,
      packages: availablePackages.map(p => p.identifier)
    });
  }, [isNative, loading, offerings, availablePackages]);

  if (!isNative) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground text-center">
              Premium subscriptions are available through the mobile app. 
              Download the app to unlock all features!
            </p>
          </div>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm max-h-[90vh] p-0">
        <ScrollArea className="max-h-[85vh]">
          <div className="p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Crown className="w-6 h-6 text-yellow-500" />
                Trackd Golf Premium
              </DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-6">
              {/* Features list */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Unlock all premium features:</p>
                {PREMIUM_FEATURES.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Subscription packages */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-6 space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Loading subscriptions...
                  </p>
                </div>
              ) : availablePackages.length > 0 ? (
                <div className="space-y-3">
                  {availablePackages.map((pkg) => (
                    <Button
                      key={pkg.identifier}
                      className="w-full h-auto py-4 flex flex-col"
                      onClick={() => handlePurchase(pkg)}
                      disabled={purchasing || restoring}
                    >
                      {purchasing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <span className="font-semibold">
                            {getPackageLabel(pkg.packageType)} Subscription
                          </span>
                          <span className="text-sm opacity-90">
                            {pkg.product.priceString}{getPackageDuration(pkg.packageType)}
                          </span>
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <Button
                    className="w-full h-auto py-4"
                    disabled={true}
                  >
                    <span className="font-semibold">Purchases not available yet</span>
                  </Button>
                  <p className="text-center text-muted-foreground text-xs">
                    Please try again later or contact support if this persists.
                  </p>
                </div>
              )}

              {/* Restore purchases */}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={handleRestore}
                disabled={purchasing || restoring}
              >
                {restoring ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Restore Purchases
              </Button>

              {/* Apple-required subscription disclosure */}
              <div className="space-y-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Payment will be charged to your Apple ID account at confirmation of purchase. 
                  Subscriptions automatically renew unless cancelled at least 24 hours before 
                  the end of the current period. You can manage or cancel your subscription 
                  in your App Store account settings.
                </p>

                {/* Legal links */}
                <div className="flex items-center justify-center gap-4">
                  <a
                    href={PRIVACY_POLICY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline flex items-center gap-1"
                  >
                    Privacy Policy
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href={TERMS_OF_USE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary underline flex items-center gap-1"
                  >
                    Terms of Use
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
