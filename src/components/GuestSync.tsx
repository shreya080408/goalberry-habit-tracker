import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { localStore } from "@/lib/local-store";
import { clearGuest, useSession } from "@/lib/session";

/**
 * When a guest signs in, everything saved on the device is pushed to the
 * account once and then cleared locally.
 */
export function GuestSync() {
  const { userId } = useSession();
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId) return;
    clearGuest();
    if (!localStore.hasData()) return;

    void (async () => {
      const habits = localStore.habits();
      const rewards = localStore.rewards();

      if (habits.length > 0) {
        await supabase.from("habits").insert(
          habits.map((h) => ({
            user_id: userId,
            name: h.name,
            description: h.description,
            days: h.days,
            difficulty: h.difficulty,
            start_date: h.startDate,
            end_date: h.endDate,
            completions: h.completions,
            skips: h.skips,
          })),
        );
      }
      if (rewards.length > 0) {
        await supabase.from("rewards").insert(
          rewards.map((r) => ({
            user_id: userId,
            name: r.name,
            points: r.points,
            claimed_at: r.claimedAt,
          })),
        );
      }
      localStore.clear();
      void qc.invalidateQueries();
      toast.success("Your device data is now saved to your account.");
    })();
  }, [userId, qc]);

  return null;
}

export default GuestSync;
