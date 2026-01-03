import { useState, useEffect, useCallback } from 'react';
import { Purchases, type CustomerInfo, type PurchasesOfferings, type PurchasesPackage } from '@revenuecat/purchases-capacitor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  isNativePlatform,
  initializeRevenueCat,
  setRevenueCatUserId,
  logOutRevenueCat,
  getCustomerInfo,
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasActiveEntitlement,
  getActiveProductId,
} from '@/lib/revenueCat';

// RevenueCat API key - this is a public key, safe to include in client code
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || '';

interface UseRevenueCatReturn {
  isNative: boolean;
  isInitialized: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isPremium: boolean;
  loading: boolean;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refreshCustomerInfo: () => Promise<void>;
}

export const useRevenueCat = (): UseRevenueCatReturn => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [loading, setLoading] = useState(true);

  const isNative = isNativePlatform();

  // Sync subscription status to database
  const syncSubscriptionToDatabase = useCallback(async (info: CustomerInfo) => {
    if (!user) return;

    const isPremiumActive = hasActiveEntitlement(info);
    const productId = getActiveProductId(info);

    try {
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      // Note: We can only INSERT via service role due to RLS
      // For now, we just log the status - webhook should handle actual DB updates
      console.log('RevenueCat sync:', {
        userId: user.id,
        customerId: info.originalAppUserId,
        isPremium: isPremiumActive,
        productId,
        existingRecord: !!existing,
      });
    } catch (error) {
      console.error('Failed to sync subscription to database:', error);
    }
  }, [user]);

  // Initialize RevenueCat when user is authenticated
  useEffect(() => {
    const init = async () => {
      if (!isNative || !REVENUECAT_API_KEY) {
        setLoading(false);
        return;
      }

      try {
        await initializeRevenueCat(REVENUECAT_API_KEY);
        setIsInitialized(true);

        if (user) {
          await setRevenueCatUserId(user.id);
          
          const info = await getCustomerInfo();
          if (info) {
            setCustomerInfo(info);
            await syncSubscriptionToDatabase(info);
          }

          const offers = await getOfferings();
          setOfferings(offers);
        }
      } catch (error) {
        console.error('Failed to initialize RevenueCat:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [isNative, user, syncSubscriptionToDatabase]);

  // Handle user logout
  useEffect(() => {
    if (!user && isInitialized) {
      logOutRevenueCat();
      setCustomerInfo(null);
    }
  }, [user, isInitialized]);

  // Listen for customer info updates
  useEffect(() => {
    if (!isNative || !isInitialized) return;

    let listenerId: string | null = null;

    Purchases.addCustomerInfoUpdateListener(async (info: CustomerInfo) => {
      setCustomerInfo(info);
      await syncSubscriptionToDatabase(info);
    }).then(id => {
      listenerId = id;
    });

    return () => {
      if (listenerId) {
        Purchases.removeCustomerInfoUpdateListener({ listenerToRemove: listenerId });
      }
    };
  }, [isNative, isInitialized, syncSubscriptionToDatabase]);

  const refreshCustomerInfo = useCallback(async () => {
    const info = await getCustomerInfo();
    if (info) {
      setCustomerInfo(info);
      await syncSubscriptionToDatabase(info);
    }
  }, [syncSubscriptionToDatabase]);

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    setLoading(true);
    try {
      const info = await purchasePackage(pkg);
      if (info) {
        setCustomerInfo(info);
        await syncSubscriptionToDatabase(info);
        toast.success('Purchase successful! Welcome to Premium.');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Purchase failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [syncSubscriptionToDatabase]);

  const restore = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const info = await restorePurchases();
      if (info) {
        setCustomerInfo(info);
        await syncSubscriptionToDatabase(info);
        
        if (hasActiveEntitlement(info)) {
          toast.success('Purchases restored successfully!');
          return true;
        } else {
          toast.info('No active subscriptions found to restore.');
          return false;
        }
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Failed to restore purchases.');
      return false;
    } finally {
      setLoading(false);
    }
  }, [syncSubscriptionToDatabase]);

  const isPremium = customerInfo ? hasActiveEntitlement(customerInfo) : false;

  return {
    isNative,
    isInitialized,
    customerInfo,
    offerings,
    isPremium,
    loading,
    purchase,
    restore,
    refreshCustomerInfo,
  };
};
