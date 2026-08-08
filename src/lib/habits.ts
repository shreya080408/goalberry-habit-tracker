import { useCallback, useEffect, useState } from "react";

export type Habit = {
  id: string;
  name: string;
  /** 0 = Sunday ... 6 = Saturday */
  days: number[];
  color: string;
  createdAt: string;
  /** ISO date strings (yyyy-mm-dd) that were completed */
  completions: string[];
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

export const HABIT_COLORS = [
  "var(--habit-1)",
  "var(--habit-2)",
  "var(--habit-3)",
  "var(--habit-4)",
  "var(--habit-5)",
];

const STORAGE_KEY = "habits.v1";

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

/** The 7 days ending today (oldest first). */
export function lastSevenDays(today = new Date()) {
  return Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
}

export function isScheduled(habit: Habit, date: Date) {
  return habit.days.includes(date.getDay());
}

export function currentStreak(habit: Habit, today = new Date()) {
  let streak = 0;
  let cursor = new Date(today);
  for (let i = 0; i < 365; i++) {
    if (isScheduled(habit, cursor)) {
      if (habit.completions.includes(toDateKey(cursor))) {
        streak++;
      } else if (toDateKey(cursor) !== toDateKey(today)) {
        break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function read(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
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

  const createHabit = useCallback((input: { name: string; days: number[]; color: string }) => {
    setHabits((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        days: input.days,
        color: input.color,
        createdAt: new Date().toISOString(),
        completions: [],
      },
    ]);
  }, []);

  const updateHabit = useCallback(
    (id: string, patch: Partial<Pick<Habit, "name" | "days" | "color">>) => {
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
              completions: h.completions.includes(key)
                ? h.completions.filter((c) => c !== key)
                : [...h.completions, key],
            }
          : h,
      ),
    );
  }, []);

  return { habits, loaded, createHabit, updateHabit, deleteHabit, toggleCompletion };
}
