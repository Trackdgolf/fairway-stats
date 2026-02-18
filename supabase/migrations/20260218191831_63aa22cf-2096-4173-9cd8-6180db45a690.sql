
-- Drop the existing authenticated-only SELECT policy
DROP POLICY IF EXISTS "Authenticated users can read active influencers" ON public.influencers;

-- Create a new permissive SELECT policy for public (anon + authenticated)
CREATE POLICY "Public can read active influencers"
ON public.influencers
AS PERMISSIVE
FOR SELECT
TO public
USING (is_active = true);
