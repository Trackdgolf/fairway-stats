-- Remove duplicated email field from public profiles to reduce exposure surface
ALTER TABLE public.profiles DROP COLUMN IF EXISTS email;

-- Update new-user handler to stop copying email into public schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;
