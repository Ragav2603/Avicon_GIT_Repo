-- Fix 1: Rate limits table - disable RLS since only service role should access it
-- Service role bypasses RLS anyway, but having RLS enabled with no policies causes issues
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;

-- Fix 2: Drop overly permissive policies on adoption_audits that override restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.adoption_audits;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.adoption_audits;

-- Fix 3: Drop overly permissive policies on audit_items that override restrictive policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.audit_items;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.audit_items;