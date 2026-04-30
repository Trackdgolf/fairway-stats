import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';

export type PremiumStatus = 'loading' | 'active' | 'inactive';

export const usePremiumStatus = () => {
  const { isPremium: isDbPremium, loading: dbLoading } = useSubscription();
  const { isPremium: isRcPremium, loading: rcLoading, isNative, isInitialized } = useRevenueCat();

  // On native: wait for both SDK initialization AND customer info loading
  // This prevents showing 'inactive' while RevenueCat is still initializing
  const nativeLoading = rcLoading || !isInitialized;
  const loading = isNative ? nativeLoading : dbLoading;

  // Dev-only bypass: set VITE_FORCE_PREMIUM=true in .env to unlock premium locally.
  // This is ignored in production builds.
  const forcePremium =
    import.meta.env.DEV && import.meta.env.VITE_FORCE_PREMIUM === 'true';

  const isPremium = forcePremium || (isNative ? isRcPremium : isDbPremium);

  // Derive explicit status
  const status: PremiumStatus = forcePremium
    ? 'active'
    : loading
      ? 'loading'
      : isPremium
        ? 'active'
        : 'inactive';

  return { isPremium, loading, status };
};
