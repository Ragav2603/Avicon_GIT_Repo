-- Add attachment_url and airline_response columns to submissions
ALTER TABLE public.submissions 
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS airline_response TEXT,
ADD COLUMN IF NOT EXISTS response_status TEXT DEFAULT 'pending' CHECK (response_status IN ('pending', 'accepted', 'rejected', 'shortlisted'));

-- Create storage bucket for proposal attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proposal-attachments', 
  'proposal-attachments', 
  false,
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Vendors can upload their own attachments
CREATE POLICY "Vendors can upload proposal attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'proposal-attachments' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can view attachments for RFPs they're involved in
CREATE POLICY "Users can view relevant proposal attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'proposal-attachments'
  AND (
    -- Vendor can see their own attachments
    auth.uid()::text = (storage.foldername(name))[1]
    OR
    -- Airlines can see attachments for their RFPs
    EXISTS (
      SELECT 1 FROM public.submissions s
      JOIN public.rfps r ON r.id = s.rfp_id
      WHERE s.vendor_id::text = (storage.foldername(name))[1]
      AND r.airline_id = auth.uid()
    )
  )
);

-- Storage policy: Vendors can delete their own attachments
CREATE POLICY "Vendors can delete own attachments"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'proposal-attachments'
  AND auth.uid()::text = (storage.foldername(name))[1]
);