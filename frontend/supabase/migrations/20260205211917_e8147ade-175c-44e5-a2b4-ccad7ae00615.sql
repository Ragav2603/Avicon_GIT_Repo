-- Add magic_link_token column to rfps table for frictionless vendor response
ALTER TABLE public.rfps 
ADD COLUMN IF NOT EXISTS magic_link_token UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS magic_link_expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days');

-- Create index for magic link lookups
CREATE INDEX IF NOT EXISTS idx_rfps_magic_link_token ON public.rfps(magic_link_token);

-- Add vendor_invites table for tracking vendor invitations to specific RFPs
CREATE TABLE IF NOT EXISTS public.vendor_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rfp_id UUID NOT NULL REFERENCES public.rfps(id) ON DELETE CASCADE,
  vendor_email TEXT NOT NULL,
  invite_token UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days'),
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on invite token
CREATE UNIQUE INDEX IF NOT EXISTS idx_vendor_invites_token ON public.vendor_invites(invite_token);

-- Enable RLS
ALTER TABLE public.vendor_invites ENABLE ROW LEVEL SECURITY;

-- RLS policies for vendor_invites
CREATE POLICY "Airlines can create invites for their RFPs"
ON public.vendor_invites
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.rfps WHERE rfps.id = rfp_id AND rfps.airline_id = auth.uid()
));

CREATE POLICY "Airlines can view invites for their RFPs"
ON public.vendor_invites
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.rfps WHERE rfps.id = rfp_id AND rfps.airline_id = auth.uid()
));

-- Add adoption_data_uploads table for CSV ingestion
CREATE TABLE IF NOT EXISTS public.adoption_data_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audit_id UUID REFERENCES public.adoption_audits(id) ON DELETE CASCADE,
  consultant_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT,
  records_processed INTEGER DEFAULT 0,
  upload_status TEXT DEFAULT 'pending',
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  raw_data JSONB
);

-- Enable RLS
ALTER TABLE public.adoption_data_uploads ENABLE ROW LEVEL SECURITY;

-- RLS policies for adoption_data_uploads
CREATE POLICY "Consultants can create uploads"
ON public.adoption_data_uploads
FOR INSERT
WITH CHECK (consultant_id = auth.uid());

CREATE POLICY "Consultants can view their uploads"
ON public.adoption_data_uploads
FOR SELECT
USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can update their uploads"
ON public.adoption_data_uploads
FOR UPDATE
USING (consultant_id = auth.uid())
WITH CHECK (consultant_id = auth.uid());

-- Add fit_score and deal_breaker_flags to submissions table for collaborative scoring
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS fit_score NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS deal_breaker_flags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS weighted_scores JSONB DEFAULT '{}'::jsonb;