import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GuestSync } from "@/components/GuestSync";
import { isGuestChosen } from "@/lib/session";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if ((error || !data.user) && !isGuestChosen()) throw redirect({ to: "/auth" });
    return { user: data.user ?? null };
  },
  component: () => (
    <>
      <GuestSync />
      <Outlet />
    </>
  ),
});
