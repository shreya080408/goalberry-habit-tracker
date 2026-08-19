import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { supabase } from "@/integrations/supabase/client";
import { chooseGuest } from "@/lib/session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Goalberry habit tracker" },
      {
        name: "description",
        content:
          "Sign in or create a Goalberry account to keep your habits, streaks and points saved.",
      },
      { property: "og:title", content: "Sign in — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Create an account to keep your habits, streaks and rewards saved.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function authErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : "Something went wrong";
  if (/rate limit/i.test(message)) {
    return "Too many emails sent recently — please wait a few minutes and try again.";
  }
  return message;
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState<string | null>(null);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [pendingReset, setPendingReset] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) void navigate({ to: "/" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        void navigate({ to: "/" });
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const submit = async () => {
    setBusy(true);
    setNeedsConfirm(false);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
        });
        if (error) throw error;
        if (data.session) {
          void navigate({ to: "/" });
          return;
        }
        setPendingConfirm(email);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (/confirm/i.test(error.message)) {
            setNeedsConfirm(true);
            throw new Error("Please confirm your email first — we can resend the link.");
          }
          throw error;
        }
      }
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    const target = pendingConfirm ?? email;
    if (!target) return;
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: target,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });
    if (error) toast.error(authErrorMessage(error));
    else toast.success(`Confirmation link sent to ${target}.`);
  };

  const sendResetLink = async () => {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset`,
      });
      if (error) throw error;
      setPendingReset(email);
    } catch (error) {
      toast.error(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const continueAsGuest = () => {
    chooseGuest();
    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="animate-pop-in w-full max-w-sm rounded-2xl border border-border bg-card/95 p-7 shadow-[0_20px_60px_-30px_color-mix(in_oklab,var(--main-dark)_35%,transparent)] backdrop-blur">
        <div className="flex flex-col items-center text-center">
          <StrawberryIcon className="size-14" />
          <h1 className="font-display heading-shadow mt-3 text-2xl text-main-dark">Goalberry</h1>
        </div>

        {pendingConfirm ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-main-dark">
              If <strong>{pendingConfirm}</strong> is new here, check your inbox for a
              confirmation link to finish setting up your account.
            </p>
            <p className="text-sm text-main-dark/70">
              Already have an account? You don't need to wait for an email — just sign in.
            </p>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-main-dark underline-offset-4 hover:underline"
              onClick={() => {
                setPendingConfirm(null);
                setMode("signin");
              }}
            >
              Sign in instead
            </button>
            <Button variant="outline" className="bouncy-press w-full" onClick={() => void resend()}>
              Resend confirmation email
            </Button>
          </div>
        ) : pendingReset ? (
          <div className="mt-6 space-y-4 text-center">
            <p className="text-sm text-main-dark">
              If <strong>{pendingReset}</strong> has an account, we've sent a link to reset your
              password.
            </p>
            <button
              type="button"
              className="w-full text-center text-sm font-semibold text-main-dark underline-offset-4 hover:underline"
              onClick={() => setPendingReset(null)}
            >
              Back to sign in
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="w-fit border-b border-main-dark/40 pb-0.5">
                Email:
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="w-fit border-b border-main-dark/40 pb-0.5">
                Password:
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
              {mode === "signin" && (
                <button
                  type="button"
                  className="block text-right text-xs text-main-dark/70 underline-offset-4 hover:underline"
                  onClick={() => void sendResetLink()}
                >
                  Forgot password?
                </button>
              )}
            </div>

            <Button
              className="bouncy-press w-full"
              disabled={busy || !email || !password}
              onClick={() => void submit()}
            >
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            {needsConfirm && (
              <Button
                variant="outline"
                className="bouncy-press w-full"
                onClick={() => void resend()}
              >
                Resend confirmation email
              </Button>
            )}

            <Button variant="outline" className="bouncy-press w-full" onClick={() => void google()}>
              Continue with Google
            </Button>

            <button
              type="button"
              className="w-full text-center text-sm text-main-dark/70 underline-offset-4 hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New here? Create an account"
                : "Already have an account? Sign in"}
            </button>

            <div className="border-t border-border pt-4">
              <Button variant="ghost" className="bouncy-press w-full" onClick={continueAsGuest}>
                Continue without an account
              </Button>
              <p className="mt-1 text-center text-xs text-main-dark/60">
                Saved on this device — sign in later from Settings to sync it.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
