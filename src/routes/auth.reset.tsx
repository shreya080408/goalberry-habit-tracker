import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/reset")({
  ssr: false,
  head: () => ({
    meta: [{ title: "Reset password — Goalberry habit tracker" }],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const ran = useRef(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

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

        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("No session");
        setReady(true);
      } catch {
        setFailed(true);
        toast.error("That reset link is invalid or has expired. Please request a new one.");
        void navigate({ to: "/auth" });
      }
    })();
  }, [navigate]);

  const submit = async () => {
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in.");
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-pop-in w-full max-w-sm rounded-2xl border border-border bg-card/95 p-7 shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--main-dark)_35%,transparent)] backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <StrawberryIcon className="size-14" />
          <h1 className="font-display heading-shadow mt-3 text-2xl text-main-dark">Goalberry</h1>
        </div>

        {ready ? (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="w-fit border-b border-main-dark/40 pb-0.5">
                New password:
              </Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className="w-fit border-b border-main-dark/40 pb-0.5"
              >
                Confirm password:
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <Button
              className="bouncy-press w-full"
              disabled={busy || !password || !confirm}
              onClick={() => void submit()}
            >
              {busy ? "Updating…" : "Update password"}
            </Button>
          </div>
        ) : (
          <p className="mt-6 text-center text-sm text-main-dark">
            {failed ? "That link didn't work — redirecting to sign in…" : "Checking your reset link…"}
          </p>
        )}
      </div>
    </div>
  );
}
