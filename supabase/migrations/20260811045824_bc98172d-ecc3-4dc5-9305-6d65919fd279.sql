CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  include_skips BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  days SMALLINT[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  difficulty SMALLINT NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  completions DATE[] NOT NULL DEFAULT '{}',
  skips DATE[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_select_own" ON public.habits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "habits_insert_own" ON public.habits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update_own" ON public.habits FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_delete_own" ON public.habits FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX habits_user_idx ON public.habits(user_id);

CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  points INTEGER NOT NULL CHECK (points > 0),
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rewards_select_own" ON public.rewards FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "rewards_insert_own" ON public.rewards FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rewards_update_own" ON public.rewards FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rewards_delete_own" ON public.rewards FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX rewards_user_idx ON public.rewards(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.points_balance()
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT SUM(cardinality(h.completions) * h.difficulty * 10
             - cardinality(h.skips) * h.difficulty * 50)
    FROM public.habits h WHERE h.user_id = auth.uid()
  ), 0)::int
  - COALESCE((
    SELECT SUM(r.points) FROM public.rewards r
    WHERE r.user_id = auth.uid() AND r.claimed_at IS NOT NULL
  ), 0)::int;
$$;
GRANT EXECUTE ON FUNCTION public.points_balance() TO authenticated;

CREATE OR REPLACE FUNCTION public.skip_habit(_habit_id UUID, _day DATE)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cost INTEGER;
  _balance INTEGER;
BEGIN
  SELECT difficulty * 50 INTO _cost FROM public.habits
  WHERE id = _habit_id AND user_id = auth.uid();
  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Habit not found';
  END IF;

  IF EXISTS (SELECT 1 FROM public.habits WHERE id = _habit_id AND user_id = auth.uid() AND _day = ANY(skips)) THEN
    RETURN public.points_balance();
  END IF;

  _balance := public.points_balance();
  IF _balance < _cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  UPDATE public.habits
  SET skips = array_append(skips, _day),
      completions = array_remove(completions, _day)
  WHERE id = _habit_id AND user_id = auth.uid();

  RETURN public.points_balance();
END;
$$;
GRANT EXECUTE ON FUNCTION public.skip_habit(UUID, DATE) TO authenticated;

CREATE OR REPLACE FUNCTION public.claim_reward(_reward_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _cost INTEGER;
  _claimed TIMESTAMPTZ;
BEGIN
  SELECT points, claimed_at INTO _cost, _claimed FROM public.rewards
  WHERE id = _reward_id AND user_id = auth.uid();
  IF _cost IS NULL THEN
    RAISE EXCEPTION 'Reward not found';
  END IF;
  IF _claimed IS NOT NULL THEN
    RETURN public.points_balance();
  END IF;
  IF public.points_balance() < _cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_POINTS';
  END IF;

  UPDATE public.rewards SET claimed_at = now()
  WHERE id = _reward_id AND user_id = auth.uid();

  RETURN public.points_balance();
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_reward(UUID) TO authenticated;