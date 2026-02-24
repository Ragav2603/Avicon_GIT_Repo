-- Fix 1: Add RLS policies for adoption_audits table
-- Allow consultants to create audits where they are the consultant
CREATE POLICY "Consultants can create audits" ON public.adoption_audits
FOR INSERT TO authenticated
WITH CHECK (consultant_id = auth.uid());

-- Allow consultants to view their own audits
CREATE POLICY "Consultants can view their audits" ON public.adoption_audits
FOR SELECT TO authenticated
USING (consultant_id = auth.uid());

-- Allow consultants to update their own audits
CREATE POLICY "Consultants can update their audits" ON public.adoption_audits
FOR UPDATE TO authenticated
USING (consultant_id = auth.uid())
WITH CHECK (consultant_id = auth.uid());

-- Allow consultants to delete their own audits
CREATE POLICY "Consultants can delete their audits" ON public.adoption_audits
FOR DELETE TO authenticated
USING (consultant_id = auth.uid());

-- Allow airlines to view audits where they are the subject
CREATE POLICY "Airlines can view audits about them" ON public.adoption_audits
FOR SELECT TO authenticated
USING (airline_id = auth.uid());

-- Fix 2: Restrict profiles table - only allow users to view their own profile
-- Drop the overly permissive policy first
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create restrictive policy: users can only see their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());