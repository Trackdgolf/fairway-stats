import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { toast } from 'sonner';

const PENDING_KEY = 'pending_referral_code';

export const savePendingReferral = (code: string) => {
  localStorage.setItem(PENDING_KEY, code);
};

export const clearPendingReferral = () => {
  localStorage.removeItem(PENDING_KEY);
};

export const getPendingReferral = (): string | null => {
  return localStorage.getItem(PENDING_KEY);
};

/**
 * After signup, checks for a pending referral code and inserts it into the referrals table.
 * Should be mounted in a component that renders after auth is available (e.g. App root).
 */
export const usePendingReferral = () => {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const processedRef = useRef(false);

  useEffect(() => {
    if (!user || processedRef.current) return;

    const pending = getPendingReferral();
    if (!pending) return;

    processedRef.current = true;

    const applyReferral = async () => {
      try {
        // Re-validate influencer
        const { data: influencer } = await supabase
          .from('influencers')
          .select('id')
          .eq('code', pending)
          .eq('is_active', true)
          .maybeSingle();

        if (!influencer) {
          clearPendingReferral();
          toast.info('Referral code expired');
          return;
        }

        const { error } = await supabase.from('referrals').insert({
          user_id: user.id,
          influencer_id: influencer.id,
          code: pending,
          status: 'claimed',
        });

        if (error) {
          if (error.code === '23505') {
            toast.info('Referral already applied');
          } else {
            console.error('Referral insert error:', error);
          }
        } else {
          toast.success(`Referral applied: ${pending}`);
        }
      } catch (err) {
        console.error('Pending referral error:', err);
      } finally {
        clearPendingReferral();
      }
    };

    applyReferral();
  }, [user, supabase]);
};
