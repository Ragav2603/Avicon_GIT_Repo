-- Create approved_domains table for email domain validation
CREATE TABLE public.approved_domains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.approved_domains ENABLE ROW LEVEL SECURITY;

-- Only consultants (admins) can manage approved domains
CREATE POLICY "Consultants can manage domains" ON public.approved_domains
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'consultant'))
WITH CHECK (public.has_role(auth.uid(), 'consultant'));

-- Add some sample approved domains for testing
INSERT INTO public.approved_domains (domain, role, description, is_active) VALUES
  ('airline.com', 'airline', 'Sample airline domain', true),
  ('consulting.com', 'consultant', 'Sample consulting domain', true);