import { useCallback, useEffect, useState } from "react";

export type Habit = {
  id: string;
  name: string;
  /** 0 = Sunday ... 6 = Saturday */
  days: number[];
  /** 1 (easiest) to 5 (hardest) */
  difficulty: number;
  createdAt: string;
  /** ISO date strings (yyyy-mm-dd) that were completed */
  completions: string[];
  /** ISO date strings (yyyy-mm-dd) that were skipped (streak kept, points deducted) */
  skips: string[];
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

const STORAGE_KEY = "habits.v2";

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

export function isScheduled(habit: Habit, date: Date) {
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

/** Scheduled days between the habit's creation and `today` (inclusive). */
export function scheduledDates(habit: Habit, today = new Date()) {
  const start = new Date(habit.createdAt);
  start.setHours(0, 0, 0, 0);
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

/** Daily success rate (0..100) for the last `days` days, oldest first. */
export function dailySeries(
  habits: Habit[],
  days: number,
  includeSkips = true,
  today = new Date(),
) {
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(today, i - (days - 1));
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


type StoredHabit = Partial<Habit> & { color?: string };

function migrate(raw: StoredHabit[]): Habit[] {
  return raw.map((h) => ({
    id: h.id ?? crypto.randomUUID(),
    name: h.name ?? "Untitled",
    days: h.days ?? [0, 1, 2, 3, 4, 5, 6],
    difficulty: h.difficulty ?? 1,
    createdAt: h.createdAt ?? new Date().toISOString(),
    completions: h.completions ?? [],
    skips: h.skips ?? [],
  }));
}

function read(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem("habits.v1");
    return raw ? migrate(JSON.parse(raw) as StoredHabit[]) : [];
  } catch {
    return [];
  }
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHabits(read());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits, loaded]);

  const createHabit = useCallback((input: { name: string; days: number[]; difficulty: number }) => {
    setHabits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        days: input.days,
        difficulty: input.difficulty,
        createdAt: new Date().toISOString(),
        completions: [],
        skips: [],
      },
    ]);
  }, []);

  const updateHabit = useCallback(
    (id: string, patch: Partial<Pick<Habit, "name" | "days" | "difficulty">>) => {
      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
    },
    [],
  );

  const deleteHabit = useCallback((id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const toggleCompletion = useCallback((id: string, date: Date) => {
    const key = toDateKey(date);
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              skips: h.skips.filter((s) => s !== key),
              completions: h.completions.includes(key)
                ? h.completions.filter((c) => c !== key)
                : [...h.completions, key],
            }
          : h,
      ),
    );
  }, []);

  const toggleSkip = useCallback((id: string, date: Date) => {
    const key = toDateKey(date);
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              completions: h.completions.filter((c) => c !== key),
              skips: h.skips.includes(key)
                ? h.skips.filter((s) => s !== key)
                : [...h.skips, key],
            }
          : h,
      ),
    );
  }, []);

  return {
    habits,
    loaded,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    toggleSkip,
  };
}
