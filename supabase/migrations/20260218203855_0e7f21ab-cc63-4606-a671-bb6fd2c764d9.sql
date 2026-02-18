
-- 1) Add per-period CPA columns to influencers
ALTER TABLE public.influencers
  ADD COLUMN IF NOT EXISTS commission_monthly_cpa numeric NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS commission_annual_cpa numeric NOT NULL DEFAULT 9;

-- 2) Add conversion tracking columns to referrals
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS converted_product_id text,
  ADD COLUMN IF NOT EXISTS converted_entitlement_id text,
  ADD COLUMN IF NOT EXISTS converted_period text,
  ADD COLUMN IF NOT EXISTS converted_at timestamptz,
  ADD COLUMN IF NOT EXISTS payable_amount numeric;

-- 3) Drop and recreate the influencer_referral_stats view with new aggregations
DROP VIEW IF EXISTS public.influencer_referral_stats;

CREATE VIEW public.influencer_referral_stats
WITH (security_invoker = on) AS
SELECT
  i.id AS influencer_id,
  i.handle,
  i.code,
  i.is_active,
  i.commission_monthly_cpa,
  i.commission_annual_cpa,
  COUNT(r.id) AS total_claimed,
  COUNT(r.id) FILTER (WHERE r.status IN ('converted', 'paid')) AS total_converted,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') AS total_paid,
  COUNT(r.id) FILTER (WHERE r.status IN ('converted', 'paid') AND r.converted_period = 'monthly') AS total_converted_monthly,
  COUNT(r.id) FILTER (WHERE r.status IN ('converted', 'paid') AND r.converted_period = 'annual') AS total_converted_annual,
  COALESCE(SUM(r.payable_amount) FILTER (WHERE r.status = 'converted'), 0) AS total_payable_amount,
  MAX(r.claimed_at) AS last_claimed_at
FROM public.influencers i
LEFT JOIN public.referrals r ON r.influencer_id = i.id
GROUP BY i.id, i.handle, i.code, i.is_active, i.commission_monthly_cpa, i.commission_annual_cpa;
