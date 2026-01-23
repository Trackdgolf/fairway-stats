-- Create table for tracking premium lifecycle emails
CREATE TABLE public.premium_lifecycle_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rc_app_user_id TEXT NOT NULL,
  trial_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Email #1: Trial confirmation (sent immediately)
  email1_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Email #2: Check-in tip (scheduled, marketing opt-in only)
  email2_resend_email_id TEXT,
  email2_scheduled_for TIMESTAMP WITH TIME ZONE,
  email2_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Email #3: Trial ending reminder (scheduled, always sent)
  email3_resend_email_id TEXT,
  email3_scheduled_for TIMESTAMP WITH TIME ZONE,
  email3_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Idempotency: track last processed event to prevent duplicates
  last_rc_event_id TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_trial UNIQUE (user_id, trial_start_at)
);

-- Enable RLS
ALTER TABLE public.premium_lifecycle_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this table (webhook handler uses service role)
CREATE POLICY "Service role can manage all lifecycle emails"
ON public.premium_lifecycle_emails
FOR ALL
USING (((auth.jwt() ->> 'role'::text) = 'service_role'::text));

-- Users can view their own lifecycle email records
CREATE POLICY "Users can view their own lifecycle emails"
ON public.premium_lifecycle_emails
FOR SELECT
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_premium_lifecycle_user_id ON public.premium_lifecycle_emails(user_id);
CREATE INDEX idx_premium_lifecycle_rc_app_user_id ON public.premium_lifecycle_emails(rc_app_user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_premium_lifecycle_emails_updated_at
BEFORE UPDATE ON public.premium_lifecycle_emails
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();