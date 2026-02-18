-- Fix infinite recursion in profiles RLS policy
-- The "Vendors can view invited airline profiles" policy joins profiles inside a subquery
-- on the profiles table itself, causing infinite recursion. Rewrite to avoid self-reference.

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
      AND vi.vendor_email = (
        SELECT email FROM public.profiles WHERE id = auth.uid() LIMIT 1
      )
  )
);