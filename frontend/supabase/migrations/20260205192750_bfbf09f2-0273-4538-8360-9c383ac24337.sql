-- Re-enable RLS on rate_limits and add service_role policy
-- This is the proper approach to keep RLS enabled while allowing service role access
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS by default, but we add an explicit policy for clarity
-- This policy documents that only service_role should access this table
CREATE POLICY "Service role manages rate limits"
ON public.rate_limits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);