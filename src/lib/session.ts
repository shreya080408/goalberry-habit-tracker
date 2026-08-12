import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const GUEST_FLAG = "goalberry.guest";

export function isGuestChosen() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(GUEST_FLAG) === "1";
}

export function chooseGuest() {
  window.localStorage.setItem(GUEST_FLAG, "1");
}

export function clearGuest() {
  window.localStorage.removeItem(GUEST_FLAG);
}

/**
 * Current auth state. `userId === null` means the app runs in guest mode and
 * everything is stored on the device until the user signs in.
 */
export function useSession() {
  const { data, isFetched } = useQuery({
    queryKey: ["session"],
    staleTime: 0,
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return null;
      return {
        userId: user.id,
        email: user.email ?? null,
        provider: (user.app_metadata?.provider as string | undefined) ?? "email",
      };
    },
  });

  return {
    session: data ?? null,
    userId: data?.userId ?? null,
    isGuest: isFetched && !data,
    loaded: isFetched,
  };
}
