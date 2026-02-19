import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isNativePlatform, setRevenueCatUserId, logOutRevenueCat } from '@/lib/revenueCat';

/**
 * Ensures RevenueCat App User ID always matches the Supabase auth.uid().
 * Mount once near the app root (like usePendingReferral).
 * 
 * - On login: calls Purchases.logIn(user.id) so RC customer = Supabase UUID
 * - On logout: calls Purchases.logOut() to clear identity
 * - Guards: only fires when user.id changes, catches errors silently
 */
export const useRevenueCatIdentity = () => {
  const { user } = useAuth();
  const lastSyncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (!isNativePlatform()) return;

    const syncIdentity = async () => {
      if (user?.id) {
        // Only logIn if user changed
        if (lastSyncedUserId.current === user.id) return;
        try {
          console.log('RC Identity: logging in', user.id.substring(0, 8) + '...');
          await setRevenueCatUserId(user.id);
          lastSyncedUserId.current = user.id;
          console.log('RC Identity: synced successfully');
        } catch (error) {
          console.error('RC Identity: logIn failed (non-blocking)', error);
          // Don't block app usage
        }
      } else {
        // User logged out
        if (lastSyncedUserId.current) {
          try {
            console.log('RC Identity: logging out');
            await logOutRevenueCat();
            lastSyncedUserId.current = null;
          } catch (error) {
            console.error('RC Identity: logOut failed (non-blocking)', error);
          }
        }
      }
    };

    syncIdentity();
  }, [user?.id]);
};
