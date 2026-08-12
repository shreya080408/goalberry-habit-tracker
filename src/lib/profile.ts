import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { localStore } from "@/lib/local-store";
import { useSession } from "@/lib/session";

export type Profile = {
  id: string;
  email: string | null;
  includeSkips: boolean;
};

export function useProfile() {
  const qc = useQueryClient();
  const { userId, loaded: sessionLoaded } = useSession();

  const { data, isFetched } = useQuery({
    queryKey: ["profile", userId ?? "guest"],
    enabled: sessionLoaded,
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const { data: created, error: insertError } = await supabase
          .from("profiles")
          .insert({ id: auth.user.id, email: auth.user.email ?? null })
          .select()
          .single();
        if (insertError) throw insertError;
        return {
          id: created.id,
          email: created.email,
          includeSkips: created.include_skips,
        } as Profile;
      }
      return { id: data.id, email: data.email, includeSkips: data.include_skips } as Profile;
    },
  });

  const { data: localPref } = useQuery({
    queryKey: ["local-prefs"],
    queryFn: () => localStore.includeSkips(),
    enabled: sessionLoaded && !userId,
  });

  const update = useMutation({
    mutationFn: async (patch: { includeSkips: boolean }) => {
      if (!userId) {
        localStore.setIncludeSkips(patch.includeSkips);
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({ include_skips: patch.includeSkips })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["profile"] });
      void qc.invalidateQueries({ queryKey: ["local-prefs"] });
    },
  });

  return {
    profile: data ?? null,
    loaded: isFetched,
    includeSkips: userId ? (data?.includeSkips ?? true) : (localPref ?? true),
    setIncludeSkips: (value: boolean) => update.mutate({ includeSkips: value }),
  };
}
