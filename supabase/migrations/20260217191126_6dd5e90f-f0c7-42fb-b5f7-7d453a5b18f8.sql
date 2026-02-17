
-- Add country column to rounds table for geographic challenges
ALTER TABLE public.rounds ADD COLUMN country text;

-- Add penalties column to hole_stats table for penalty tracking challenges
ALTER TABLE public.hole_stats ADD COLUMN penalties integer;
