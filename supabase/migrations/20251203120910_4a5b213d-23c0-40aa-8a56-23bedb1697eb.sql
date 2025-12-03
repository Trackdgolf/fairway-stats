-- Create rounds table
CREATE TABLE public.rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  course_id TEXT,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create hole_stats table
CREATE TABLE public.hole_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id UUID REFERENCES public.rounds(id) ON DELETE CASCADE NOT NULL,
  hole_number INTEGER NOT NULL,
  par INTEGER,
  score INTEGER,
  fir BOOLEAN,
  fir_direction TEXT,
  gir BOOLEAN,
  gir_direction TEXT,
  scramble TEXT,
  putts INTEGER,
  tee_club TEXT,
  approach_club TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hole_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for rounds
CREATE POLICY "Users can view their own rounds"
ON public.rounds FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rounds"
ON public.rounds FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own rounds"
ON public.rounds FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own rounds"
ON public.rounds FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for hole_stats (via round ownership)
CREATE POLICY "Users can view their hole stats"
ON public.hole_stats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = hole_stats.round_id
  AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can insert their hole stats"
ON public.hole_stats FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = hole_stats.round_id
  AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can update their hole stats"
ON public.hole_stats FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = hole_stats.round_id
  AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can delete their hole stats"
ON public.hole_stats FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = hole_stats.round_id
  AND rounds.user_id = auth.uid()
));