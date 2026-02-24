-- Fix infinite recursion in profiles RLS policy
-- The "Vendors can view invited airline profiles" policy references profiles table inside itself
-- Replace it with a security definer function to break the recursion

CREATE OR REPLACE FUNCTION public.get_current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop and recreate the offending policy using the helper function
DROP POLICY IF EXISTS "Vendors can view invited airline profiles" ON public.profiles;

CREATE POLICY "Vendors can view invited airline profiles"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'vendor'::app_role)
  AND EXISTS (
    SELECT 1
    FROM rfps r
    JOIN vendor_invites vi ON vi.rfp_id = r.id
    WHERE r.airline_id = profiles.id
      AND vi.vendor_email = public.get_current_user_email()
  )
);