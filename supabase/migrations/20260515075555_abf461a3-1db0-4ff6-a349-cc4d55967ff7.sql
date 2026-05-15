
-- 1. Prevent privilege escalation: block authenticated users from inserting/updating roles
CREATE POLICY "Only service role can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "Only service role can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);

CREATE POLICY "Only service role can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (false);

-- 2. marketing_subscribers: enforce user_id and tighten SELECT
ALTER TABLE public.marketing_subscribers
  ALTER COLUMN user_id SET NOT NULL;

DROP POLICY IF EXISTS "Users can view their own marketing subscription" ON public.marketing_subscribers;
CREATE POLICY "Users can view their own marketing subscription"
ON public.marketing_subscribers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 3. Revoke EXECUTE on SECURITY DEFINER functions from public roles.
-- These are called from triggers, RLS policies (run as definer), or service role only.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_premium_user(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_influencer_id_by_code(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_welcome_email_on_signup() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_in_progress_rounds_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.normalize_influencer_code() FROM PUBLIC, anon, authenticated;
