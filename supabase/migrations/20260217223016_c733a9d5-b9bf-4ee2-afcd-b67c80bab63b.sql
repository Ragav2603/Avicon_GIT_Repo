
-- Fix: Add cross-role SELECT policies for profiles table
-- Consultants need to view airline profiles for audit/client management
-- Airlines need to view vendor profiles for submission review

-- Allow consultants to view all profiles (for audit and client management)
CREATE POLICY "Consultants can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'consultant'::app_role));

-- Allow airlines to view vendor profiles (for RFP submissions review)
CREATE POLICY "Airlines can view vendor profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'airline'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.submissions s
    JOIN public.rfps r ON r.id = s.rfp_id
    WHERE r.airline_id = auth.uid()
    AND s.vendor_id = profiles.id
  )
);

-- Allow vendors to view airline profiles for RFPs they're invited to
CREATE POLICY "Vendors can view invited airline profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'vendor'::app_role)
  AND public.is_vendor_invited_to_rfp(auth.uid(), (
    SELECT r.id FROM public.rfps r
    JOIN public.vendor_invites vi ON vi.rfp_id = r.id
    JOIN public.profiles p ON p.email = vi.vendor_email
    WHERE p.id = auth.uid()
    AND r.airline_id = profiles.id
    LIMIT 1
  ))
);
