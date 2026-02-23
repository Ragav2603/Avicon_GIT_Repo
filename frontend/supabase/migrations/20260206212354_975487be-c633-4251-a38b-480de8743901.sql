-- Fix: Drop and recreate the view with explicit SECURITY INVOKER
DROP VIEW IF EXISTS public.vendor_invites_safe;

CREATE VIEW public.vendor_invites_safe 
WITH (security_invoker = true) AS
SELECT 
  id,
  rfp_id,
  vendor_email,
  expires_at,
  used_at,
  created_at
FROM public.vendor_invites;