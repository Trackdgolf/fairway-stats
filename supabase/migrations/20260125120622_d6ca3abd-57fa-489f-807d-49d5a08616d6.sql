-- Add has_seen_welcome column to track if user has seen the welcome modal
ALTER TABLE public.profiles 
ADD COLUMN has_seen_welcome boolean DEFAULT false;