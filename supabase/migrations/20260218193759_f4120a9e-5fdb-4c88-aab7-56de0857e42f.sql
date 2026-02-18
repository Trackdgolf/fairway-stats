
CREATE OR REPLACE VIEW public.influencer_referral_stats AS
SELECT
  i.id AS influencer_id,
  i.handle,
  i.code,
  i.is_active,
  COUNT(r.id) AS total_claimed,
  COUNT(r.id) FILTER (WHERE r.status = 'converted') AS total_converted,
  COUNT(r.id) FILTER (WHERE r.status = 'paid') AS total_paid,
  MAX(r.claimed_at) AS last_claimed_at
FROM public.influencers i
LEFT JOIN public.referrals r ON r.influencer_id = i.id
GROUP BY i.id, i.handle, i.code, i.is_active;

-- Enable RLS on the view (views inherit from underlying tables, but we add explicit security)
-- Grant access only to authenticated users; service role always has access
ALTER VIEW public.influencer_referral_stats SET (security_invoker = on);
