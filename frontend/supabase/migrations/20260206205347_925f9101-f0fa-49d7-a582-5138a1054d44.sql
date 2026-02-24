-- Create a security definer function to check if user is invited to an RFP
-- This breaks the recursion by bypassing RLS when checking vendor_invites
CREATE OR REPLACE FUNCTION public.is_vendor_invited_to_rfp(_user_id uuid, _rfp_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM vendor_invites vi
    JOIN profiles p ON p.email = vi.vendor_email
    WHERE vi.rfp_id = _rfp_id
      AND p.id = _user_id
  )
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Invited vendors can read their invited RFPs" ON public.rfps;

-- Recreate using the security definer function
CREATE POLICY "Invited vendors can read their invited RFPs" 
ON public.rfps 
FOR SELECT 
USING (public.is_vendor_invited_to_rfp(auth.uid(), id));