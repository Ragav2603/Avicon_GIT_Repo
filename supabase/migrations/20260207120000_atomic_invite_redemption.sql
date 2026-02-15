-- Atomic function to redeem an invite code
-- This prevents race conditions where multiple users could use the same code simultaneously
-- exceeding the max_uses limit.
CREATE OR REPLACE FUNCTION public.redeem_invite_code(
  invite_id UUID,
  user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Lock the row for update to prevent race conditions
  -- This ensures that only one transaction can modify this row at a time
  SELECT * INTO invite_record
  FROM public.invite_codes
  WHERE id = invite_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid invite code');
  END IF;

  -- Validation checks
  IF NOT invite_record.is_active THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite code is not active');
  END IF;

  IF invite_record.expires_at IS NOT NULL AND invite_record.expires_at < now() THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite code expired');
  END IF;

  IF invite_record.max_uses IS NOT NULL AND invite_record.current_uses >= invite_record.max_uses THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invite code exhausted');
  END IF;

  -- Insert usage record
  -- This will fail if the user has already used this code due to unique constraint
  BEGIN
    INSERT INTO public.invite_code_uses (invite_code_id, user_id)
    VALUES (invite_id, user_id);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'Code already used by this user');
  END;

  -- Increment usage count
  UPDATE public.invite_codes
  SET current_uses = current_uses + 1
  WHERE id = invite_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
