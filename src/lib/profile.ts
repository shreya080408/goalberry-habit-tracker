import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Profile = {
  id: string;
  email: string | null;
  includeSkips: boolean;
};

export function useProfile() {
  const qc = useQueryClient();

  const { data, isFetched } = useQuery({
    queryKey: ["profile"],
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

  const update = useMutation({
    mutationFn: async (patch: { includeSkips: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { error } = await supabase
        .from("profiles")
        .update({ include_skips: patch.includeSkips })
        .eq("id", auth.user.id);
      if (error) throw error;
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["profile"] }),
  });

  return {
    profile: data ?? null,
    loaded: isFetched,
    includeSkips: data?.includeSkips ?? true,
    setIncludeSkips: (value: boolean) => update.mutate({ includeSkips: value }),
  };
}
