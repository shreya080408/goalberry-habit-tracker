import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

const HABIT_KEYS = ["habits.v2", "habits.v1"];
const REWARD_KEY = "rewards.v1";
const DISMISSED_KEY = "goalberry.localImportDone";

type LocalHabit = {
  name?: string;
  days?: number[];
  difficulty?: number;
  createdAt?: string;
  completions?: string[];
  skips?: string[];
};

type LocalReward = { name?: string; points?: number };

function readLocal() {
  if (typeof window === "undefined") return { habits: [], rewards: [] };
  const habitsRaw = HABIT_KEYS.map((k) => window.localStorage.getItem(k)).find(Boolean);
  const rewardsRaw = window.localStorage.getItem(REWARD_KEY);
  let habits: LocalHabit[] = [];
  let rewards: LocalReward[] = [];
  try {
    habits = habitsRaw ? (JSON.parse(habitsRaw) as LocalHabit[]) : [];
  } catch {
    habits = [];
  }
  try {
    rewards = rewardsRaw ? (JSON.parse(rewardsRaw) as LocalReward[]) : [];
  } catch {
    rewards = [];
  }
  return { habits, rewards };
}

/**
 * One-time offer to bring habits/rewards saved on this device into the account.
 */
export function LocalImportPrompt() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<{ habits: LocalHabit[]; rewards: LocalReward[] }>({
    habits: [],
    rewards: [],
  });

  useEffect(() => {
    if (window.localStorage.getItem(DISMISSED_KEY)) return;
    const local = readLocal();
    if (local.habits.length === 0 && local.rewards.length === 0) return;
    void (async () => {
      const { count } = await supabase.from("habits").select("id", { count: "exact", head: true });
      if ((count ?? 0) > 0) {
        window.localStorage.setItem(DISMISSED_KEY, "1");
        return;
      }
      setPayload(local);
      setOpen(true);
    })();
  }, []);

  const finish = () => {
    window.localStorage.setItem(DISMISSED_KEY, "1");
    setOpen(false);
  };

  const doImport = async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return finish();

    if (payload.habits.length > 0) {
      await supabase.from("habits").insert(
        payload.habits.map((h) => ({
          user_id: auth.user!.id,
          name: h.name ?? "Untitled",
          days: h.days ?? [0, 1, 2, 3, 4, 5, 6],
          difficulty: h.difficulty ?? 1,
          start_date: (h.createdAt ?? new Date().toISOString()).slice(0, 10),
          completions: h.completions ?? [],
          skips: h.skips ?? [],
        })),
      );
    }
    if (payload.rewards.length > 0) {
      await supabase.from("rewards").insert(
        payload.rewards
          .filter((r) => r.name && (r.points ?? 0) > 0)
          .map((r) => ({ user_id: auth.user!.id, name: r.name!, points: r.points! })),
      );
    }
    void qc.invalidateQueries();
    finish();
  };

  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && finish()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">Bring your data over?</AlertDialogTitle>
          <AlertDialogDescription>
            We found {payload.habits.length} habit(s) and {payload.rewards.length} reward(s) saved
            on this device from before you had an account. Import them now?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={finish}>No thanks</AlertDialogCancel>
          <AlertDialogAction onClick={() => void doImport()}>Import</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default LocalImportPrompt;
