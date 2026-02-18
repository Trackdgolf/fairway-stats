
-- Add payout tracking columns to referrals
ALTER TABLE public.referrals
  ADD COLUMN IF NOT EXISTS paid_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS payout_batch_id text NULL;
