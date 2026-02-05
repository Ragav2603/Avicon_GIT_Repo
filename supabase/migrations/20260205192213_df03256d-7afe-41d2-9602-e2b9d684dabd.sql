-- Fix 1: Deactivate default invite codes that are hardcoded and publicly known
UPDATE public.invite_codes 
SET is_active = false 
WHERE code IN ('AIRLINE2024', 'CONSULTANT2024');

-- Fix 2: Drop the public SELECT policy on invite_codes that exposes all active codes
DROP POLICY IF EXISTS "Anyone can validate invite codes" ON public.invite_codes;