import { useState, useEffect } from 'react';
import { Crown, Check, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
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

// Fallback packages when RevenueCat products are unavailable
const FALLBACK_PACKAGES = [
  { id: 'monthly', label: 'Premium Monthly', duration: '/month' },
  { id: 'annual', label: 'Premium Annual', duration: '/year' },
];

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

// Check if a package has valid pricing
const hasValidPricing = (pkg: PurchasesPackage): boolean => {
  return !!(pkg.product?.priceString && pkg.product.priceString.trim() !== '');
};

export const PaywallModal = ({ open, onOpenChange }: PaywallModalProps) => {
  const { offerings, purchase, restore, loading, isNative, refreshCustomerInfo } = useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [fetchError, setFetchError] = useState(false);

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

  const handleRetry = async () => {
    console.log('Paywall: Retry - re-fetching offerings from RevenueCat');
    setRetrying(true);
    setFetchError(false);
    try {
      await refreshCustomerInfo();
      console.log('Paywall: Retry complete');
    } catch (error) {
      console.error('Paywall: Retry failed', error);
      setFetchError(true);
    }
    setRetrying(false);
  };

  // Get the current offering's available packages
  const availablePackages = offerings?.current?.availablePackages || [];
  
  // Check if packages have valid pricing (not "Waiting for Review" state)
  const packagesWithValidPricing = availablePackages.filter(hasValidPricing);
  
  // Determine fallback state - ANY of these conditions triggers fallback
  const shouldShowFallback = !loading && isNative && (
    !offerings ||                           // No offerings at all
    !offerings.current ||                   // No current offering
    availablePackages.length === 0 ||       // No packages in offering
    packagesWithValidPricing.length === 0 || // No packages with valid pricing
    fetchError                              // Fetch error occurred
  );

  // Determine fallback reason for logging
  const getFallbackReason = (): string => {
    if (fetchError) return 'fetch_error';
    if (!offerings) return 'no_offerings';
    if (!offerings.current) return 'no_current_offering';
    if (availablePackages.length === 0) return 'empty_packages';
    if (packagesWithValidPricing.length === 0) return 'missing_pricing';
    return 'unknown';
  };

  // Log detailed debugging info
  useEffect(() => {
    if (!isNative) {
      console.log('Paywall: Not on native platform, packages unavailable');
      return;
    }
    
    if (loading) {
      console.log('Paywall: Loading offerings from RevenueCat...');
      return;
    }
    
    // Detailed debug logging
    const debugInfo = {
      offeringsCount: offerings ? Object.keys(offerings.all || {}).length : 0,
      currentOffering: offerings?.current?.identifier || 'none',
      packagesCount: availablePackages.length,
      packagesWithValidPricingCount: packagesWithValidPricing.length,
      shouldShowFallback,
      fallbackReason: shouldShowFallback ? getFallbackReason() : 'n/a',
    };
    
    console.log('Paywall Debug:', debugInfo);
    
    if (shouldShowFallback) {
      console.log(`Paywall Fallback: Triggered - reason: ${getFallbackReason()}`);
    }
    
    // Check each package for pricing issues
    availablePackages.forEach((pkg) => {
      const hasPricing = hasValidPricing(pkg);
      console.log(`Paywall Package: ${pkg.identifier}`, {
        packageType: pkg.packageType,
        productId: pkg.product?.identifier,
        priceString: pkg.product?.priceString || 'MISSING',
        hasValidPricing: hasPricing,
      });
      
      if (!hasPricing) {
        console.log(`Paywall Warning: Package ${pkg.identifier} has no price - product may be "Waiting for Review" in App Store`);
      }
    });
  }, [isNative, loading, offerings, availablePackages, packagesWithValidPricing, shouldShowFallback, fetchError]);

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
              ) : shouldShowFallback ? (
                /* Fallback UI when packages are unavailable or pricing is missing */
                <div className="space-y-4">
                  {/* Fallback package display - styled like normal buttons but disabled */}
                  <div className="space-y-3">
                    {FALLBACK_PACKAGES.map((pkg) => (
                      <Button
                        key={pkg.id}
                        className="w-full h-auto py-4 flex flex-col"
                        disabled={true}
                        variant="outline"
                      >
                        <span className="font-semibold">
                          {pkg.label}
                        </span>
                        <span className="text-sm opacity-70">
                          Price shown at checkout
                        </span>
                      </Button>
                    ))}
                  </div>
                  
                  {/* Unavailable message */}
                  <p className="text-center text-muted-foreground text-sm">
                    Subscriptions are temporarily unavailable. Please try again.
                  </p>
                  
                  {/* Retry button */}
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={handleRetry}
                    disabled={retrying}
                  >
                    {retrying ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Retry
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {packagesWithValidPricing.map((pkg) => (
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
