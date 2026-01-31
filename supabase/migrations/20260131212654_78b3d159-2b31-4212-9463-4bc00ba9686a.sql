-- Create signup_requests table for admin approval workflow
CREATE TABLE public.signup_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  requested_role app_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.signup_requests ENABLE ROW LEVEL SECURITY;

-- Consultants can view and manage all signup requests
CREATE POLICY "Consultants can view all signup requests"
  ON public.signup_requests
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'consultant'));

CREATE POLICY "Consultants can update signup requests"
  ON public.signup_requests
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'consultant'));

-- Anyone can insert signup requests (for new users requesting access)
CREATE POLICY "Anyone can request signup"
  ON public.signup_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Consultants can delete signup requests"
  ON public.signup_requests
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'consultant'));