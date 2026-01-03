import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Capacitor } from '@capacitor/core';
import {
  initializeRevenueCat,
  setRevenueCatUserId,
  logOutRevenueCat,
  isNativePlatform,
} from '@/lib/revenueCat';

export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'past_due';
export type PlanType = 'free' | 'premium';

interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planType: PlanType;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  revenuecatCustomerId: string | null;
  revenuecatProductId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  loading: boolean;
  isPremium: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// RevenueCat API key - public key, safe for client code
const REVENUECAT_API_KEY = import.meta.env.VITE_REVENUECAT_PUBLIC_API_KEY || '';

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueCatInitialized, setRevenueCatInitialized] = useState(false);

  // Initialize RevenueCat on native platforms
  useEffect(() => {
    const initRC = async () => {
      if (isNativePlatform() && REVENUECAT_API_KEY && !revenueCatInitialized) {
        try {
          await initializeRevenueCat(REVENUECAT_API_KEY);
          setRevenueCatInitialized(true);
          console.log('RevenueCat initialized in SubscriptionProvider');
        } catch (error) {
          console.error('Failed to initialize RevenueCat:', error);
        }
      }
    };
    initRC();
  }, [revenueCatInitialized]);

  // Set RevenueCat user ID when user logs in
  useEffect(() => {
    const setRCUser = async () => {
      if (user && revenueCatInitialized && isNativePlatform()) {
        try {
          await setRevenueCatUserId(user.id);
        } catch (error) {
          console.error('Failed to set RevenueCat user:', error);
        }
      } else if (!user && revenueCatInitialized && isNativePlatform()) {
        await logOutRevenueCat();
      }
    };
    setRCUser();
  }, [user, revenueCatInitialized]);

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching subscription:', error);
      setLoading(false);
      return;
    }

    if (data) {
      setSubscription({
        id: data.id,
        status: data.status as SubscriptionStatus,
        planType: data.plan_type as PlanType,
        stripeCustomerId: data.stripe_customer_id,
        stripeSubscriptionId: data.stripe_subscription_id,
        revenuecatCustomerId: data.revenuecat_customer_id,
        revenuecatProductId: data.revenuecat_product_id,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end,
      });
    } else {
      // No subscription record - user is on free plan
      setSubscription(null);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isPremium = subscription?.status === 'active' && subscription?.planType === 'premium';

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        loading, 
        isPremium,
        refreshSubscription: fetchSubscription 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};