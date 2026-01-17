-- Add deadline column to rfps table
ALTER TABLE public.rfps
ADD COLUMN deadline timestamp with time zone;

-- Airlines can view their own RFPs (add policy for this)
CREATE POLICY "Airlines can view their own RFPs"
ON public.rfps
FOR SELECT
USING (airline_id = auth.uid());