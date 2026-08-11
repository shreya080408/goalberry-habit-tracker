REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.points_balance() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.skip_habit(UUID, DATE) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.claim_reward(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.points_balance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.skip_habit(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_reward(UUID) TO authenticated;