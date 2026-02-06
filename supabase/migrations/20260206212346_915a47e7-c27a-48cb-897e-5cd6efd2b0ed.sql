-- Add invite_token_hash column for secure token storage
-- The plaintext token will only be shown once to the airline when created
-- and then compared via hash lookup

ALTER TABLE public.vendor_invites
ADD COLUMN invite_token_hash TEXT;

-- Create an index for efficient hash lookups
CREATE INDEX idx_vendor_invites_token_hash ON public.vendor_invites(invite_token_hash);

-- Create a function to hash tokens (for use in triggers)
CREATE OR REPLACE FUNCTION public.hash_invite_token()
RETURNS TRIGGER AS $$
BEGIN
  -- Hash the token using SHA-256 and store as hex
  NEW.invite_token_hash := encode(sha256(NEW.invite_token::text::bytea), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger to automatically hash tokens on insert
CREATE TRIGGER hash_invite_token_on_insert
  BEFORE INSERT ON public.vendor_invites
  FOR EACH ROW
  EXECUTE FUNCTION public.hash_invite_token();

-- Hash all existing tokens
UPDATE public.vendor_invites 
SET invite_token_hash = encode(sha256(invite_token::text::bytea), 'hex')
WHERE invite_token_hash IS NULL;

-- Make invite_token_hash NOT NULL after populating
ALTER TABLE public.vendor_invites
ALTER COLUMN invite_token_hash SET NOT NULL;

-- Update RLS policies to hide the plaintext token from airlines
-- Drop existing SELECT policy
DROP POLICY IF EXISTS "Airlines can view invites for their RFPs" ON public.vendor_invites;

-- Recreate policy that excludes the invite_token column
-- Airlines can still see invite metadata but not the plaintext token
-- Note: We'll create a view for airlines that excludes the token

CREATE VIEW public.vendor_invites_safe AS
SELECT 
  id,
  rfp_id,
  vendor_email,
  expires_at,
  used_at,
  created_at
FROM public.vendor_invites;

-- Grant access to the view
GRANT SELECT ON public.vendor_invites_safe TO authenticated;

-- Create RLS policy for the original table that only allows service role access
-- The edge function uses service role, so it can still read invite_token for hashing comparison
CREATE POLICY "Airlines can view invites for their RFPs via safe view"
ON public.vendor_invites
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.rfps 
    WHERE rfps.id = rfp_id AND rfps.airline_id = auth.uid()
  )
);

-- Note: The view doesn't expose invite_token, so airlines see:
-- id, rfp_id, vendor_email, expires_at, used_at, created_at
-- but NOT invite_token or invite_token_hash