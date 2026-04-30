-- Create putt_details table for per-putt tracking
CREATE TABLE public.putt_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  round_id UUID NOT NULL,
  hole_number INTEGER NOT NULL,
  putt_index INTEGER NOT NULL,
  distance_bucket TEXT NOT NULL CHECK (distance_bucket IN ('0-3','4-8','9-14','15+')),
  outcome TEXT NOT NULL CHECK (outcome IN ('holed','short','long','left','right','lipped_out')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (round_id, hole_number, putt_index)
);

CREATE INDEX idx_putt_details_round_id ON public.putt_details(round_id);

ALTER TABLE public.putt_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their putt details"
ON public.putt_details FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = putt_details.round_id AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can insert their putt details"
ON public.putt_details FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = putt_details.round_id AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can update their putt details"
ON public.putt_details FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = putt_details.round_id AND rounds.user_id = auth.uid()
));

CREATE POLICY "Users can delete their putt details"
ON public.putt_details FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.rounds
  WHERE rounds.id = putt_details.round_id AND rounds.user_id = auth.uid()
));