import { useSubscription } from '@/contexts/SubscriptionContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';

export type PremiumStatus = 'loading' | 'active' | 'inactive';

export const usePremiumStatus = () => {
  const forcePremium = import.meta.env.VITE_FORCE_PREMIUM === 'true';
  const { isPremium: isDbPremium, loading: dbLoading } = useSubscription();
  const { isPremium: isRcPremium, loading: rcLoading, isNative, isInitialized } = useRevenueCat();

  // Dev override takes precedence
  if (forcePremium) {
    console.log('Premium status: FORCED via VITE_FORCE_PREMIUM');
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

  console.log('Premium status:', { 
    status,
    isPremium, 
    source: isNative ? 'RevenueCat' : 'Database',
    loading,
    ...(isNative && { isInitialized, rcLoading })
  });

  return { isPremium, loading, status };
};
