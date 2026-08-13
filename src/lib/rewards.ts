import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { INSUFFICIENT_POINTS, totalPoints } from "@/lib/habits";
import { localStore, newId } from "@/lib/local-store";
import { useSession } from "@/lib/session";

export type Reward = {
  id: string;
  name: string;
  points: number;
  claimedAt: string | null;
  createdAt: string;
};

type RewardRow = {
  id: string;
  name: string;
  points: number;
  claimed_at: string | null;
  created_at: string;
};

function localBalance() {
  const claimed = localStore.rewards().filter((r) => r.claimedAt);
  return totalPoints(localStore.habits()) - claimed.reduce((sum, r) => sum + r.points, 0);
}

export function useRewards() {
  const qc = useQueryClient();
  const { userId, loaded: sessionLoaded } = useSession();

  const { data, isFetched } = useQuery({
    queryKey: ["rewards", userId ?? "guest"],
    enabled: sessionLoaded,
    queryFn: async () => {
      if (!userId) return localStore.rewards();
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as unknown as RewardRow[]).map((r) => ({
        id: r.id,
        name: r.name,
        points: r.points,
        claimedAt: r.claimed_at,
        createdAt: r.created_at,
      }));
    },
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["rewards"] });
    void qc.invalidateQueries({ queryKey: ["points"] });
  };

  const saveLocal = (next: Reward[]) => {
    localStore.setRewards(next);
    invalidate();
  };

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; points: number }) => {
      if (!userId) {
        saveLocal([
          ...localStore.rewards(),
          {
            id: newId(),
            name: input.name.trim(),
            points: input.points,
            claimedAt: null,
            createdAt: new Date().toISOString(),
          },
        ]);
        return;
      }
      const { error } = await supabase
        .from("rewards")
        .insert({ name: input.name.trim(), points: input.points });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, name, points }: { id: string; name: string; points: number }) => {
      if (!userId) {
        saveLocal(
          localStore
            .rewards()
            .map((r) => (r.id === id ? { ...r, name: name.trim(), points } : r)),
        );
        return;
      }
      const { error } = await supabase
        .from("rewards")
        .update({ name: name.trim(), points })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        saveLocal(localStore.rewards().filter((r) => r.id !== id));
        return;
      }
      const { error } = await supabase.from("rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const claimMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!userId) {
        const reward = localStore.rewards().find((r) => r.id === id);
        if (!reward || reward.claimedAt) return;
        if (localBalance() < reward.points) throw new Error(INSUFFICIENT_POINTS);
        saveLocal(
          localStore
            .rewards()
            .map((r) => (r.id === id ? { ...r, claimedAt: new Date().toISOString() } : r)),
        );
        return;
      }
      const { error } = await supabase.rpc("claim_reward", { _reward_id: id });
      if (error) {
        throw new Error(
          error.message.includes(INSUFFICIENT_POINTS) ? INSUFFICIENT_POINTS : error.message,
        );
      }
    },
    onSuccess: invalidate,
  });

  const rewards = data ?? [];

  return {
    rewards,
    open: rewards.filter((r) => !r.claimedAt),
    claimed: rewards.filter((r) => r.claimedAt),
    loaded: isFetched,
    createReward: (input: { name: string; points: number }) => createMutation.mutate(input),
    updateReward: (input: { id: string; name: string; points: number }) =>
      updateMutation.mutate(input),
    deleteReward: (id: string) => deleteMutation.mutate(id),
    claimReward: (id: string) => claimMutation.mutateAsync(id),
  };
}
