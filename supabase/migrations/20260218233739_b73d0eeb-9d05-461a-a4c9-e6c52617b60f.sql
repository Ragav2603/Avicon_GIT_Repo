
-- Make proposals bucket private (it was created as public which is insecure)
UPDATE storage.buckets SET public = false WHERE id = 'proposals';

-- RLS: Vendors can upload to their own folder
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Vendors can upload own proposals'
  ) THEN
    CREATE POLICY "Vendors can upload own proposals"
    ON storage.objects FOR INSERT
    WITH CHECK (
      bucket_id = 'proposals'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- RLS: Vendors can read their own proposal files; airlines can read proposals submitted to their projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Vendors and airlines can read proposals'
  ) THEN
    CREATE POLICY "Vendors and airlines can read proposals"
    ON storage.objects FOR SELECT
    USING (
      bucket_id = 'proposals'
      AND (
        auth.uid()::text = (storage.foldername(name))[1]
        OR EXISTS (
          SELECT 1 FROM public.project_submissions ps
          JOIN public.projects p ON p.id = ps.project_id
          WHERE ps.vendor_id::text = (storage.foldername(name))[1]
          AND p.user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

-- RLS: Vendors can delete their own proposal files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' 
    AND policyname = 'Vendors can delete own proposals'
  ) THEN
    CREATE POLICY "Vendors can delete own proposals"
    ON storage.objects FOR DELETE
    USING (
      bucket_id = 'proposals'
      AND auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
