-- Lets a signed-in user permanently delete their own account. profiles/habits/rewards
-- all have ON DELETE CASCADE on their FK to auth.users(id), so removing the auth.users
-- row cascades and cleans up everything else automatically.
CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
