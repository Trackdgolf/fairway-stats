import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';

export type PremiumStatus = 'loading' | 'active' | 'inactive';

export const usePremiumStatus = () => {
  // VITE_FORCE_PREMIUM only works in development mode to prevent production bypass
  const forcePremium = import.meta.env.DEV && import.meta.env.VITE_FORCE_PREMIUM === 'true';
  const { isPremium: isDbPremium, loading: dbLoading } = useSubscription();
  const { isPremium: isRcPremium, loading: rcLoading, isNative, isInitialized } = useRevenueCat();

  // Dev-only override takes precedence
  if (forcePremium) {
    return { isPremium: true, loading: false, status: 'active' as PremiumStatus };
  }

  // On native: wait for both SDK initialization AND customer info loading
  // This prevents showing 'inactive' while RevenueCat is still initializing
  const nativeLoading = rcLoading || !isInitialized;
  const loading = isNative ? nativeLoading : dbLoading;
  const isPremium = isNative ? isRcPremium : isDbPremium;

  // Derive explicit status
  const status: PremiumStatus = loading 
    ? 'loading' 
    : isPremium 
      ? 'active' 
      : 'inactive';

  return { isPremium, loading, status };
};
