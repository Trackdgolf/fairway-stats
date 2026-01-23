-- Drop the existing RESTRICTIVE policies and recreate as PERMISSIVE for proper access control
-- The service_role policy should remain RESTRICTIVE to ensure only service role can do bulk operations

-- Drop existing user policies
DROP POLICY IF EXISTS "Users can view their own marketing subscription" ON public.marketing_subscribers;
DROP POLICY IF EXISTS "Users can insert their own marketing subscription" ON public.marketing_subscribers;
DROP POLICY IF EXISTS "Users can update their own marketing subscription" ON public.marketing_subscribers;
DROP POLICY IF EXISTS "Users can delete their own marketing subscription" ON public.marketing_subscribers;

-- Recreate as PERMISSIVE policies (default behavior)
-- Users can only view their own subscription (by user_id OR matching email)
CREATE POLICY "Users can view their own marketing subscription"
  ON public.marketing_subscribers
  FOR SELECT
  TO authenticated
  USING (
    (auth.uid() = user_id) 
    OR (email = (SELECT email FROM auth.users WHERE id = auth.uid())::text)
  );

-- Users can only insert with their own user_id
CREATE POLICY "Users can insert their own marketing subscription"
  ON public.marketing_subscribers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own subscription
CREATE POLICY "Users can update their own marketing subscription"
  ON public.marketing_subscribers
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only delete their own subscription
CREATE POLICY "Users can delete their own marketing subscription"
  ON public.marketing_subscribers
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);