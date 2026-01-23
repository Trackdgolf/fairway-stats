-- Create the update_updated_at_column function first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create marketing_subscribers table for email marketing preferences
CREATE TABLE public.marketing_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  opted_in_at timestamp with time zone NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'app',
  unsubscribed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add index for faster email lookups
CREATE INDEX idx_marketing_subscribers_email ON public.marketing_subscribers(email);
CREATE INDEX idx_marketing_subscribers_user_id ON public.marketing_subscribers(user_id);

-- Enable Row Level Security
ALTER TABLE public.marketing_subscribers ENABLE ROW LEVEL SECURITY;

-- Users can view their own marketing subscription status
CREATE POLICY "Users can view their own marketing subscription"
ON public.marketing_subscribers
FOR SELECT
USING (auth.uid() = user_id OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Users can insert their own marketing subscription (for initial opt-in)
CREATE POLICY "Users can insert their own marketing subscription"
ON public.marketing_subscribers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own marketing subscription (for unsubscribe)
CREATE POLICY "Users can update their own marketing subscription"
ON public.marketing_subscribers
FOR UPDATE
USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for edge functions)
CREATE POLICY "Service role can manage all marketing subscriptions"
ON public.marketing_subscribers
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_marketing_subscribers_updated_at
BEFORE UPDATE ON public.marketing_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();