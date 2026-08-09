import { useCallback, useEffect, useState } from "react";

export type Reward = {
  id: string;
  name: string;
  points: number;
  createdAt: string;
};

const STORAGE_KEY = "rewards.v1";

function read(): Reward[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Reward[]) : [];
  } catch {
    return [];
  }
}

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRewards(read());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rewards));
  }, [rewards, loaded]);

  const createReward = useCallback((input: { name: string; points: number }) => {
    setRewards((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        name: input.name.trim(),
        points: input.points,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const deleteReward = useCallback((id: string) => {
    setRewards((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { rewards, loaded, createReward, deleteReward };
}
