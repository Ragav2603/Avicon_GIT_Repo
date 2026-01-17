-- Allow vendors to insert their own submissions for open RFPs only
CREATE POLICY "Vendors can create submissions"
ON public.submissions
FOR INSERT TO authenticated
WITH CHECK (
  vendor_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.rfps
    WHERE rfps.id = submissions.rfp_id
    AND rfps.status = 'open'
  )
);

-- Allow airlines to update submissions for their RFPs (for AI scoring and verification notes)
CREATE POLICY "Airlines can update submissions for their RFPs"
ON public.submissions
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rfps
    WHERE rfps.id = submissions.rfp_id
    AND rfps.airline_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rfps
    WHERE rfps.id = submissions.rfp_id
    AND rfps.airline_id = auth.uid()
  )
);