-- Add DELETE policy for marketing_subscribers table
-- Users should be able to delete their own marketing subscription records

CREATE POLICY "Users can delete their own marketing subscription"
ON public.marketing_subscribers
FOR DELETE
USING (auth.uid() = user_id);