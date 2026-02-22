-- Drop the overly permissive public SELECT policy on influencers
DROP POLICY IF EXISTS "Public can read active influencers" ON public.influencers;

-- Create a restricted policy: only authenticated users, only the fields they need (id, code)
-- Since RLS policies can't restrict columns, we create a more restrictive policy
-- that only allows authenticated users to read active influencers
CREATE POLICY "Authenticated users can read active influencers"
ON public.influencers
FOR SELECT
TO authenticated
USING (is_active = true);