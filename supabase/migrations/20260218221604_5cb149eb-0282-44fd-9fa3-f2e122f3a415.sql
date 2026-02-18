-- Add unique constraint on submissions(rfp_id, vendor_id) so upsert works
ALTER TABLE public.submissions
  ADD CONSTRAINT submissions_rfp_id_vendor_id_unique UNIQUE (rfp_id, vendor_id);