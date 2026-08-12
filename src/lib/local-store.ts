/**
 * Device storage used while the user has no account (guest mode).
 * Shapes match the cloud rows so syncing after sign-in is a straight copy.
 */
import type { Habit } from "@/lib/habits";
import type { Reward } from "@/lib/rewards";

const HABITS_KEY = "goalberry.local.habits";
const REWARDS_KEY = "goalberry.local.rewards";
const PREFS_KEY = "goalberry.local.prefs";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const localStore = {
  habits: () => read<Habit[]>(HABITS_KEY, []),
  setHabits: (habits: Habit[]) => write(HABITS_KEY, habits),
  rewards: () => read<Reward[]>(REWARDS_KEY, []),
  setRewards: (rewards: Reward[]) => write(REWARDS_KEY, rewards),
  includeSkips: () => read<{ includeSkips: boolean }>(PREFS_KEY, { includeSkips: true }).includeSkips,
  setIncludeSkips: (includeSkips: boolean) => write(PREFS_KEY, { includeSkips }),
  hasData: () => read<Habit[]>(HABITS_KEY, []).length > 0 || read<Reward[]>(REWARDS_KEY, []).length > 0,
  clear: () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(HABITS_KEY);
    window.localStorage.removeItem(REWARDS_KEY);
  },
};

export function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
