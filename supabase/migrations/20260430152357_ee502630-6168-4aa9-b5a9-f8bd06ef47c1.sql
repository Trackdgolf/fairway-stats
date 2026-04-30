
-- 1. Influencers: remove broad authenticated read, add admin-only select
DROP POLICY IF EXISTS "Authenticated users can read active influencers" ON public.influencers;

CREATE POLICY "Admins can read influencers"
ON public.influencers
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Safe lookup function returning only the influencer id (no commission data)
CREATE OR REPLACE FUNCTION public.get_influencer_id_by_code(_code text)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.influencers
  WHERE code = upper(replace(_code, ' ', ''))
    AND is_active = true
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.get_influencer_id_by_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_influencer_id_by_code(text) TO authenticated, anon;

-- 2. user_roles: prevent admin self-escalation. Admins read-only; service role manages.
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can read all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. marketing_subscribers: ensure inserted email matches the authenticated user's email
DROP POLICY IF EXISTS "Users can insert their own marketing subscription" ON public.marketing_subscribers;

CREATE POLICY "Users can insert their own marketing subscription"
ON public.marketing_subscribers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
);

-- 4. Lock down SECURITY DEFINER helper functions from public API exposure
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, authenticated, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_premium_user(uuid) FROM anon, authenticated, PUBLIC;
