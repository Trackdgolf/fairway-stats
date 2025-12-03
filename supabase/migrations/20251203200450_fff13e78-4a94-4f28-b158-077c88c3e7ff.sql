-- Create in_progress_rounds table for saving round progress
CREATE TABLE public.in_progress_rounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_data JSONB NOT NULL,
  hole_stats JSONB NOT NULL,
  current_hole_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.in_progress_rounds ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own in-progress rounds"
ON public.in_progress_rounds
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own in-progress rounds"
ON public.in_progress_rounds
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own in-progress rounds"
ON public.in_progress_rounds
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own in-progress rounds"
ON public.in_progress_rounds
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_in_progress_rounds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_in_progress_rounds_updated_at
BEFORE UPDATE ON public.in_progress_rounds
FOR EACH ROW
EXECUTE FUNCTION public.update_in_progress_rounds_updated_at();

-- Add unique constraint: one in-progress round per user per course
CREATE UNIQUE INDEX idx_in_progress_rounds_user_course 
ON public.in_progress_rounds (user_id, (course_data->>'id'));