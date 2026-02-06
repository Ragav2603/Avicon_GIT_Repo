-- =========================================
-- FIX 1: Restrict project_templates to role-based access
-- =========================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.project_templates;

-- Allow airlines and consultants to read templates (they need templates for RFP creation/auditing)
CREATE POLICY "Airlines and consultants can read templates"
  ON public.project_templates
  FOR SELECT
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'airline') 
    OR public.has_role(auth.uid(), 'consultant')
  );

-- =========================================
-- FIX 2: Restrict RFP visibility to invited vendors only  
-- =========================================
-- Drop the current open access policy
DROP POLICY IF EXISTS "Authenticated users can read open RFPs basic info" ON public.rfps;

-- Create policy: Only airlines see their RFPs, invited vendors see RFPs they're invited to
-- Note: "Airlines can view their own RFPs" already exists for airline_id = auth.uid()
-- We need to add: Vendors can only see RFPs they have invites for
CREATE POLICY "Invited vendors can read their invited RFPs"
  ON public.rfps
  FOR SELECT
  TO authenticated
  USING (
    -- Vendor has an invite for this RFP
    EXISTS (
      SELECT 1 FROM public.vendor_invites vi
      JOIN public.profiles p ON p.email = vi.vendor_email
      WHERE vi.rfp_id = rfps.id
      AND p.id = auth.uid()
    )
  );

-- =========================================
-- FIX 3: Restrict RFP creation to airlines only
-- =========================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable insert for all logged in users" ON public.rfps;

-- Only airlines can create RFPs, and they must own them
CREATE POLICY "Only airlines can create RFPs"
  ON public.rfps
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'airline')
    AND airline_id = auth.uid()
  );

-- =========================================
-- FIX 4: Restrict RFP requirements insert to RFP owners only
-- =========================================
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Enable insert for all logged in users" ON public.rfp_requirements;

-- Only RFP owners (airlines) can add requirements
CREATE POLICY "Only RFP owners can add requirements"
  ON public.rfp_requirements
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rfps
      WHERE rfps.id = rfp_requirements.rfp_id
      AND rfps.airline_id = auth.uid()
    )
  );

-- Also add update and delete policies for RFP owners
CREATE POLICY "Only RFP owners can update requirements"
  ON public.rfp_requirements
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rfps
      WHERE rfps.id = rfp_requirements.rfp_id
      AND rfps.airline_id = auth.uid()
    )
  );

CREATE POLICY "Only RFP owners can delete requirements"
  ON public.rfp_requirements
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rfps
      WHERE rfps.id = rfp_requirements.rfp_id
      AND rfps.airline_id = auth.uid()
    )
  );