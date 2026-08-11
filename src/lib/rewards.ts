import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { INSUFFICIENT_POINTS } from "@/lib/habits";

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

export function useRewards() {
  const qc = useQueryClient();

  const { data, isFetched } = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
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

  const createMutation = useMutation({
    mutationFn: async (input: { name: string; points: number }) => {
      const { error } = await supabase
        .from("rewards")
        .insert({ name: input.name.trim(), points: input.points });
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("rewards").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const claimMutation = useMutation({
    mutationFn: async (id: string) => {
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
    deleteReward: (id: string) => deleteMutation.mutate(id),
    claimReward: (id: string) => claimMutation.mutateAsync(id),
  };
}
