-- Enable pg_net extension for async HTTP calls
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create a function that sends welcome email via Edge Function
CREATE OR REPLACE FUNCTION public.send_welcome_email_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  service_role_key text;
  request_id bigint;
BEGIN
  -- Get secrets from vault
  SELECT decrypted_secret INTO supabase_url 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_URL';
  
  SELECT decrypted_secret INTO service_role_key 
  FROM vault.decrypted_secrets 
  WHERE name = 'SUPABASE_SERVICE_ROLE_KEY';
  
  -- Only proceed if we have the required secrets
  IF supabase_url IS NOT NULL AND service_role_key IS NOT NULL THEN
    -- Make async HTTP request to the Edge Function
    SELECT net.http_post(
      url := supabase_url || '/functions/v1/send-welcome-email',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || service_role_key
      ),
      body := jsonb_build_object('email', NEW.email)
    ) INTO request_id;
    
    RAISE LOG 'Welcome email request sent for user %, request_id: %', NEW.email, request_id;
  ELSE
    RAISE LOG 'Could not send welcome email - missing vault secrets';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created_send_welcome_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email_on_signup();