-- Fix handle_new_user to gracefully handle existing profiles (e.g. from magic links)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Attempt to insert the new profile.
  -- If a profile with the same email already exists (created via magic link submission),
  -- we use ON CONFLICT DO NOTHING to allow the signup to proceed.
  -- Note: This results in a profile where id != auth.users.id.
  -- The application should handle this by looking up profiles by email if necessary,
  -- or a separate migration/process should merge these accounts.
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;
