-- Add restrictive policies to prevent client-side subscription manipulation
-- Only backend/webhook with service role should modify subscription data

-- Deny INSERT - only backend/webhook should create subscriptions
CREATE POLICY "Prevent user subscription creation"
  ON public.subscriptions FOR INSERT
  WITH CHECK (false);

-- Deny UPDATE - only backend/webhook should modify subscriptions  
CREATE POLICY "Prevent user subscription updates"
  ON public.subscriptions FOR UPDATE
  USING (false);

-- Deny DELETE - only backend/webhook should delete subscriptions
CREATE POLICY "Prevent user subscription deletion"
  ON public.subscriptions FOR DELETE
  USING (false);