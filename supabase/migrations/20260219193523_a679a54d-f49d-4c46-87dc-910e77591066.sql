
-- Part B: Create influencer_users table
CREATE TABLE public.influencer_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  influencer_id uuid REFERENCES public.influencers(id) ON DELETE SET NULL,
  handle text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.influencer_users ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can access
CREATE POLICY "Service role can manage influencer_users"
  ON public.influencer_users
  FOR ALL
  USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Admins can manage influencer_users"
  ON public.influencer_users
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
