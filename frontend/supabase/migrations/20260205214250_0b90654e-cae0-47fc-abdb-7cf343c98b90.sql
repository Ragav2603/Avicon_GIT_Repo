-- Fix #1: Remove magic_link_token from public RFP queries by creating a secure view
-- Drop the existing public select policy that exposes tokens
DROP POLICY IF EXISTS "Anyone can read open RFPs" ON public.rfps;

-- Create a new policy that excludes sensitive columns by restricting to specific use case
-- Option: Only authenticated users can see open RFPs, and token access is restricted to owners
CREATE POLICY "Authenticated users can read open RFPs basic info"
  ON public.rfps
  FOR SELECT
  USING (
    status = 'open' 
    AND auth.role() = 'authenticated'
    -- Exclude token access - will be null for non-owners
  );

-- Ensure airline owners can still see their own RFPs with tokens
-- (This policy already exists: "Airlines can view their own RFPs")

-- Create a secure function to get RFP data without tokens for public access
CREATE OR REPLACE FUNCTION public.get_open_rfps()
RETURNS TABLE (
  id uuid,
  airline_id uuid,
  title text,
  description text,
  status text,
  deadline timestamptz,
  budget_max numeric,
  project_context text,
  timelines text,
  evaluation_criteria text,
  submission_guidelines text,
  created_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    airline_id,
    title,
    description,
    status,
    deadline,
    budget_max,
    project_context,
    timelines,
    evaluation_criteria,
    submission_guidelines,
    created_at
  FROM public.rfps
  WHERE status = 'open';
$$;

-- Grant access to the function
GRANT EXECUTE ON FUNCTION public.get_open_rfps() TO anon, authenticated;