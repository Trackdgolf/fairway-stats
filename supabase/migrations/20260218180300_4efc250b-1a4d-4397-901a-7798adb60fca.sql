
-- 1) Influencers table
CREATE TABLE public.influencers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  code text NOT NULL,
  commission_type text NOT NULL DEFAULT 'CPA',
  commission_value numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX idx_influencers_code ON public.influencers (code);
CREATE INDEX idx_influencers_is_active ON public.influencers (is_active);

-- RLS
ALTER TABLE public.influencers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active influencers"
  ON public.influencers FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Service role can manage influencers"
  ON public.influencers FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 2) Referrals table
CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  influencer_id uuid NOT NULL REFERENCES public.influencers(id) ON DELETE RESTRICT,
  code text NOT NULL,
  claimed_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'claimed',
  latest_rc_event_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT referrals_unique_user UNIQUE (user_id)
);

-- Indexes
CREATE INDEX idx_referrals_influencer_id ON public.referrals (influencer_id);
CREATE INDEX idx_referrals_status ON public.referrals (status);
CREATE INDEX idx_referrals_claimed_at ON public.referrals (claimed_at);

-- RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own referral"
  ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own referral"
  ON public.referrals FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Deny user updates on referrals"
  ON public.referrals FOR UPDATE
  USING (false);

CREATE POLICY "Deny user deletes on referrals"
  ON public.referrals FOR DELETE
  USING (false);

CREATE POLICY "Service role can manage referrals"
  ON public.referrals FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

-- 3) Normalize code to uppercase/no spaces on insert/update
CREATE OR REPLACE FUNCTION public.normalize_influencer_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.code := upper(replace(NEW.code, ' ', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_influencer_code
  BEFORE INSERT OR UPDATE ON public.influencers
  FOR EACH ROW EXECUTE FUNCTION public.normalize_influencer_code();

CREATE OR REPLACE FUNCTION public.normalize_referral_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.code := upper(replace(NEW.code, ' ', ''));
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_referral_code
  BEFORE INSERT OR UPDATE ON public.referrals
  FOR EACH ROW EXECUTE FUNCTION public.normalize_referral_code();

-- 4) Seed test influencer
INSERT INTO public.influencers (handle, code, commission_type, commission_value, is_active)
VALUES ('@trackdgolf_test', 'TRACKDTEST', 'CPA', 10, true);
