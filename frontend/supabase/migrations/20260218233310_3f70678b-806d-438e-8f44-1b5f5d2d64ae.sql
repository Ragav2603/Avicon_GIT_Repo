
-- Allow vendors to view their own submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'submissions' 
    AND policyname = 'Vendors view own submissions'
  ) THEN
    CREATE POLICY "Vendors view own submissions"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (vendor_id = auth.uid());
  END IF;
END $$;

-- Allow airlines to view submissions for their RFPs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'submissions' 
    AND policyname = 'Airlines view submissions for their RFPs'
  ) THEN
    CREATE POLICY "Airlines view submissions for their RFPs"
    ON public.submissions
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.rfps
        WHERE rfps.id = submissions.rfp_id
        AND rfps.airline_id = auth.uid()
      )
    );
  END IF;
END $$;
