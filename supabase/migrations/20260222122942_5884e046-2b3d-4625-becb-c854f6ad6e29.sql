-- Revoke all access to influencer_referral_stats view from public roles
-- This view is only accessed via the admin-stats edge function using service_role
REVOKE ALL ON public.influencer_referral_stats FROM anon;
REVOKE ALL ON public.influencer_referral_stats FROM authenticated;