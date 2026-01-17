-- Fix 1: Add RLS policies for vendor_profiles table
-- Vendors can create their own profile
CREATE POLICY "Vendors can create their profile"
ON public.vendor_profiles
FOR INSERT TO authenticated
WITH CHECK (profile_id = auth.uid());

-- Vendors can view their own profile
CREATE POLICY "Vendors can view own profile"
ON public.vendor_profiles
FOR SELECT TO authenticated
USING (profile_id = auth.uid());

-- Vendors can update their own profile
CREATE POLICY "Vendors can update own profile"
ON public.vendor_profiles
FOR UPDATE TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());

-- Airlines can view vendor profiles for RFP matching
CREATE POLICY "Airlines can view vendor profiles"
ON public.vendor_profiles
FOR SELECT TO authenticated
USING (
  public.has_role(auth.uid(), 'airline') OR profile_id = auth.uid()
);

-- Fix 2: Restrict rfp_requirements access to open RFPs or RFP owners
DROP POLICY IF EXISTS "Public read access for requirements" ON public.rfp_requirements;

CREATE POLICY "Users can view requirements for accessible RFPs"
ON public.rfp_requirements
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rfps
    WHERE rfps.id = rfp_requirements.rfp_id
    AND (rfps.status = 'open' OR rfps.airline_id = auth.uid())
  )
);