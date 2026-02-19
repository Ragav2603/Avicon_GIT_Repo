-- Fix check constraints to allow draft saves
-- 1. Allow pitch_text to be NULL or empty for drafts (remove min length or allow null)
ALTER TABLE public.submissions DROP CONSTRAINT submissions_pitch_length;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_pitch_length 
  CHECK (pitch_text IS NULL OR char_length(pitch_text) = 0 OR (char_length(pitch_text) >= 10 AND char_length(pitch_text) <= 10000));

-- 2. Add 'draft' as a valid status
ALTER TABLE public.submissions DROP CONSTRAINT submissions_status_check;
ALTER TABLE public.submissions ADD CONSTRAINT submissions_status_check 
  CHECK (status = ANY (ARRAY['submitted'::text, 'withdrawn'::text, 'rejected'::text, 'accepted'::text, 'draft'::text]));