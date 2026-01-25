-- Fix 1: Add DELETE policy for profiles table (GDPR compliance)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);

-- Fix 2: Add service role management policy for subscriptions table
-- This allows backend operations (webhooks, edge functions) to manage subscriptions
CREATE POLICY "Service role can manage all subscriptions" 
ON public.subscriptions 
FOR ALL 
USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);