-- Add index on consultant_id for adoption_data_uploads to optimize RLS performance
CREATE INDEX IF NOT EXISTS idx_adoption_data_uploads_consultant_id ON public.adoption_data_uploads(consultant_id);
