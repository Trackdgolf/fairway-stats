-- Add INTERNAL_WEBHOOK_SECRET to vault
SELECT vault.create_secret(
  'd8c1a4f0e5a24d1aa6b7b2a6e2f7d3c9c2f9a1b7e4d6c8f0a3b5d7e9f1c3a5b7',
  'INTERNAL_WEBHOOK_SECRET',
  'Shared secret for internal webhook authentication'
);

-- Update the trigger function to use INTERNAL_WEBHOOK_SECRET instead of SUPABASE_SERVICE_ROLE_KEY
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  internal_secret text;
  request_id bigint;
BEGIN
  -- Get secrets from vault
  SELECT decrypted_secret INTO supabase_url 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_URL';
  
  SELECT decrypted_secret INTO internal_secret 
  FROM vault.decrypted_secrets 
  WHERE name = 'INTERNAL_WEBHOOK_SECRET';
  
  -- Only proceed if we have the required secrets
  IF supabase_url IS NOT NULL AND internal_secret IS NOT NULL THEN
    -- Make async HTTP request to the Edge Function with internal secret header
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'X-Internal-Secret', internal_secret
      ),
      body := jsonb_build_object('email', NEW.email)
    ) INTO request_id;
    
    RAISE LOG 'Welcome email request sent for user %, request_id: %', NEW.email, request_id;
  ELSE
    RAISE LOG 'Could not send welcome email - missing vault secrets (url: %, secret: %)', 
      CASE WHEN supabase_url IS NULL THEN 'missing' ELSE 'present' END,
      CASE WHEN internal_secret IS NULL THEN 'missing' ELSE 'present' END;
  END IF;
  
  RETURN NEW;
END;
$$;