import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localStore, newId } from "@/lib/local-store";
import { useSession } from "@/lib/session";

export type Habit = {
  id: string;
  name: string;
  description: string | null;
  /** 0 = Sunday ... 6 = Saturday */
  days: number[];
  /** 1 (easiest) to 5 (hardest) */
  difficulty: number;
  /** yyyy-mm-dd — habit does not exist before this day */
  startDate: string;
  /** yyyy-mm-dd or null — habit does not exist after this day */
  endDate: string | null;
  createdAt: string;
  /** ISO date strings (yyyy-mm-dd) that were completed */
  completions: string[];
  /** ISO date strings (yyyy-mm-dd) that were skipped (streak kept, points deducted) */
  skips: string[];
};

export type HabitInput = {
  name: string;
  description?: string | null;
  days: number[];
  difficulty: number;
  startDate: string;
  endDate?: string | null;
};

export const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const DIFFICULTY_LEVELS = [1, 2, 3, 4, 5];

/** Level 1 -> strawberry-1 ... Level 5 -> strawberry-5 */
export function difficultyColor(level: number) {
  return `var(--main-palette-strawberry-${Math.min(5, Math.max(1, level))})`;
}

/** 10 points for level 1, 20 for level 2, ... */
export function pointsFor(difficulty: number) {
  return difficulty * 10;
}

/** A skip costs 5x the points the habit would have awarded. */
export function skipCost(difficulty: number) {
  return pointsFor(difficulty) * 5;
}

export function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

/** Scheduled on this weekday AND inside the habit's active window. */
export function isScheduled(habit: Habit, date: Date) {
  const key = toDateKey(date);
  if (key < habit.startDate) return false;
  if (habit.endDate && key > habit.endDate) return false;
  return habit.days.includes(date.getDay());
}

export function isDone(habit: Habit, date: Date) {
  return habit.completions.includes(toDateKey(date));
}

export function isSkipped(habit: Habit, date: Date) {
  return habit.skips.includes(toDateKey(date));
}

/**
 * Streak in the user's local timezone. A scheduled day that is neither
 * completed nor skipped ends the streak once that day is over (midnight).
 */
export function currentStreak(habit: Habit, today = new Date()) {
  let streak = 0;
  let cursor = new Date(today);
  const todayKey = toDateKey(today);
  for (let i = 0; i < 365; i++) {
    if (isScheduled(habit, cursor)) {
      const key = toDateKey(cursor);
      if (habit.completions.includes(key) || habit.skips.includes(key)) {
        streak++;
      } else if (key !== todayKey) {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function habitPoints(habit: Habit) {
  return (
    habit.completions.length * pointsFor(habit.difficulty) -
    habit.skips.length * skipCost(habit.difficulty)
  );
}

export function totalPoints(habits: Habit[]) {
  return habits.reduce((sum, h) => sum + habitPoints(h), 0);
}

/** Scheduled days between the habit's start and `today` (inclusive). */
export function scheduledDates(habit: Habit, today = new Date()) {
  const start = new Date(`${habit.startDate}T00:00:00`);
  const end = new Date(today);
  end.setHours(0, 0, 0, 0);
  const out: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end && out.length < 3650) {
    if (isScheduled(habit, cursor)) out.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function hitOn(habit: Habit, date: Date, includeSkips: boolean) {
  return isDone(habit, date) || (includeSkips && isSkipped(habit, date));
}

/** Success rate 0..1 — skips count as done when `includeSkips`. */
export function successRate(habit: Habit, includeSkips = true, today = new Date()) {
  const dates = scheduledDates(habit, today);
  if (dates.length === 0) return 0;
  const hit = dates.filter((d) => hitOn(habit, d, includeSkips)).length;
  return hit / dates.length;
}

export function overallSuccessRate(habits: Habit[], includeSkips = true, today = new Date()) {
  let total = 0;
  let hit = 0;
  for (const h of habits) {
    const dates = scheduledDates(h, today);
    total += dates.length;
    hit += dates.filter((d) => hitOn(h, d, includeSkips)).length;
  }
  return total === 0 ? 0 : hit / total;
}

/** Longest current streak across all habits. */
export function bestStreak(habits: Habit[], today = new Date()) {
  return habits.reduce((max, h) => Math.max(max, currentStreak(h, today)), 0);
}

/** Daily success rate (0..100) for `days` days ending at `endDate`, oldest first. */
export function dailySeries(
  habits: Habit[],
  days: number,
  includeSkips = true,
  endDate = new Date(),
) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(endDate, i - (days - 1));
    const scheduled = habits.filter((h) => isScheduled(h, date));
    const hit = scheduled.filter((h) => hitOn(h, date, includeSkips)).length;
    return {
      date: toDateKey(date),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      rate: scheduled.length === 0 ? 0 : Math.round((hit / scheduled.length) * 100),
    };
  });
}

/** Habits scheduled on a date, grouped by their status. */
export function dayBreakdown(habits: Habit[], date: Date) {
  const scheduled = habits.filter((h) => isScheduled(h, date));
  const completed = scheduled.filter((h) => isDone(h, date));
  const skipped = scheduled.filter((h) => isSkipped(h, date));
  const incomplete = scheduled.filter((h) => !isDone(h, date) && !isSkipped(h, date));
  const rate =
    scheduled.length === 0 ? 0 : (completed.length + skipped.length) / scheduled.length;
  return { scheduled, completed, skipped, incomplete, rate };
}

/* ------------------------------------------------------------------ */
/* Data layer                                                          */
/* ------------------------------------------------------------------ */

type HabitRow = {
  id: string;
  name: string;
  description: string | null;
  days: number[] | null;
  difficulty: number;
  start_date: string;
  end_date: string | null;
  completions: string[] | null;
  skips: string[] | null;
  created_at: string;
};

function fromRow(row: HabitRow): Habit {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    days: (row.days ?? []).map(Number),
    difficulty: row.difficulty,
    startDate: row.start_date,
    endDate: row.end_date,
    completions: row.completions ?? [],
    skips: row.skips ?? [],
    createdAt: row.created_at,
  };
}

export const INSUFFICIENT_POINTS = "INSUFFICIENT_POINTS";

/** Points earned from habits minus points spent on claimed rewards. */
function localBalance() {
  const habits = localStore.habits();
  const claimed = localStore.rewards().filter((r) => r.claimedAt);
  return totalPoints(habits) - claimed.reduce((sum, r) => sum + r.points, 0);
}

export function usePoints() {
  const { userId, loaded } = useSession();
  const { data } = useQuery({
    queryKey: ["points", userId ?? "guest"],
    enabled: loaded,
    queryFn: async () => {
      if (!userId) return localBalance();
      const { data, error } = await supabase.rpc("points_balance");
      if (error) throw error;
      return (data as number) ?? 0;
    },
  });
  return data ?? 0;
}

export function useHabits() {
  const qc = useQueryClient();
  const { userId, loaded: sessionLoaded } = useSession();

  const { data, isFetched } = useQuery({
    queryKey: ["habits", userId ?? "guest"],
    enabled: sessionLoaded,
    queryFn: async () => {
      if (!userId) return localStore.habits();
      const { data, error } = await supabase
        .from("habits")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as unknown as HabitRow[]).map(fromRow);
    },
  });

  const habits = data ?? [];

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["habits"] });
    void qc.invalidateQueries({ queryKey: ["points"] });
  };

  const saveLocal = (next: Habit[]) => {
    localStore.setHabits(next);
    invalidate();
  };

  const createMutation = useMutation({
    mutationFn: async (input: HabitInput) => {
      if (!userId) {
        const now = new Date();
        saveLocal([
          ...localStore.habits(),
          {
            id: newId(),
            name: input.name.trim(),
            description: input.description?.trim() || null,
            days: input.days,
            difficulty: input.difficulty,
            startDate: input.startDate,
            endDate: input.endDate || null,
            createdAt: now.toISOString(),
            completions: [],
            skips: [],
          },
        ]);
        return;
      }
      const { error } = await supabase.from("habits").insert({
        name: input.name.trim(),
        description: input.description?.trim() || null,
        days: input.days,
        difficulty: input.difficulty,
        start_date: input.startDate,
        end_date: input.endDate || null,
      });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: HabitInput }) => {
      if (!userId) {
        saveLocal(
          localStore.habits().map((h) =>
            h.id === id
              ? {
                  ...h,
                  name: patch.name.trim(),
                  description: patch.description?.trim() || null,
                  days: patch.days,
                  difficulty: patch.difficulty,
                  startDate: patch.startDate,
                  endDate: patch.endDate || null,
                }
              : h,
          ),
        );
        return;
      }
      const { error } = await supabase
        .from("habits")
        .update({
          name: patch.name.trim(),
          description: patch.description?.trim() || null,
          days: patch.days,
          difficulty: patch.difficulty,
          start_date: patch.startDate,
          end_date: patch.endDate || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        saveLocal(localStore.habits().filter((h) => h.id !== id));
        return;
      }
      const { error } = await supabase.from("habits").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const completionMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const key = toDateKey(date);
      const completions = habit.completions.includes(key)
        ? habit.completions.filter((c) => c !== key)
        : [...habit.completions, key];
      const skips = habit.skips.filter((s) => s !== key);

      if (!userId) {
        saveLocal(
          localStore.habits().map((h) => (h.id === id ? { ...h, completions, skips } : h)),
        );
        return;
      }
      const { error } = await supabase
        .from("habits")
        .update({ completions, skips })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  /** Skipping goes through a server-side check so points cannot be cheated. */
  const skipMutation = useMutation({
    mutationFn: async ({ id, date }: { id: string; date: Date }) => {
      const habit = habits.find((h) => h.id === id);
      if (!habit) return;
      const key = toDateKey(date);

      if (!userId) {
        const list = localStore.habits();
        if (habit.skips.includes(key)) {
          saveLocal(
            list.map((h) => (h.id === id ? { ...h, skips: h.skips.filter((s) => s !== key) } : h)),
          );
          return;
        }
        if (localBalance() < skipCost(habit.difficulty)) throw new Error(INSUFFICIENT_POINTS);
        saveLocal(
          list.map((h) =>
            h.id === id
              ? {
                  ...h,
                  skips: [...h.skips, key],
                  completions: h.completions.filter((c) => c !== key),
                }
              : h,
          ),
        );
        return;
      }

      if (habit.skips.includes(key)) {
        const { error } = await supabase
          .from("habits")
          .update({ skips: habit.skips.filter((s) => s !== key) })
          .eq("id", id);
        if (error) throw error;
        return;
      }
      const { error } = await supabase.rpc("skip_habit", { _habit_id: id, _day: key });
      if (error) {
        throw new Error(error.message.includes(INSUFFICIENT_POINTS) ? INSUFFICIENT_POINTS : error.message);
      }
    },
    onSuccess: invalidate,
  });

  return {
    habits,
    loaded: isFetched,
    createHabit: (input: HabitInput) => createMutation.mutate(input),
    updateHabit: (id: string, patch: HabitInput) => updateMutation.mutate({ id, patch }),
    deleteHabit: (id: string) => deleteMutation.mutate(id),
    toggleCompletion: (id: string, date: Date) => completionMutation.mutate({ id, date }),
    /** Resolves; rejects with INSUFFICIENT_POINTS when the balance is too low. */
    toggleSkip: (id: string, date: Date) => skipMutation.mutateAsync({ id, date }),
  };
}

