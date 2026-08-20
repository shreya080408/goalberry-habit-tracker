import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/confirm")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Confirming email — Goalberry habit tracker" }],
  }),
  component: ConfirmPage,
});

function ConfirmPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const ran = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const params = new URLSearchParams(window.location.search);
      const tokenHash = params.get("token_hash");
      const type = params.get("type");
      const code = params.get("code");

      try {
        if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
          if (error) throw error;
        } else if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        }

        // Implicit-flow tokens (if this project's email template still uses the
        // legacy #access_token=... redirect) are already handled automatically by
        // the client's detectSessionInUrl on initialization — nothing to do here.
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          toast.success("You're confirmed and signed in!");
          // Invalidate before navigating — otherwise _authenticated's beforeLoad
          // can render off a stale "no user" match and stay blank until refreshed.
          await router.invalidate();
          void navigate({ to: "/" });
        } else {
          toast.info("Your email is confirmed — please sign in to continue.");
          void navigate({ to: "/auth" });
        }
      } catch {
        setFailed(true);
        toast.error("That confirmation link is invalid or has expired. Please sign in.");
        void navigate({ to: "/auth" });
      }
    })();
  }, [navigate, router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <StrawberryIcon className="size-14" />
        <p className="text-sm text-main-dark">
          {failed ? "That link didn't work — redirecting to sign in…" : "Confirming your email…"}
        </p>
      </div>
    </div>
  );
}
