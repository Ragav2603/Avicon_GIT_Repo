-- Create invite_codes table for role verification
CREATE TABLE public.invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true
);

-- Create table to track which users used which invite codes
CREATE TABLE public.invite_code_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code_id UUID NOT NULL REFERENCES public.invite_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(invite_code_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_code_uses ENABLE ROW LEVEL SECURITY;

-- RLS policies for invite_codes: only admins can manage, but validation happens via edge function
-- No direct SELECT access to prevent code enumeration
CREATE POLICY "Admins can manage invite codes" ON public.invite_codes
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'consultant'))
WITH CHECK (public.has_role(auth.uid(), 'consultant'));

-- RLS policies for invite_code_uses: users can only see their own usage
CREATE POLICY "Users can view their own invite code usage" ON public.invite_code_uses
FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Insert some default invite codes for testing (can be removed in production)
INSERT INTO public.invite_codes (code, role, max_uses, is_active) VALUES
  ('AIRLINE2024', 'airline', 100, true),
  ('CONSULTANT2024', 'consultant', 50, true);