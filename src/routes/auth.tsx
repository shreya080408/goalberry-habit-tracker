import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

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
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    void navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div
        className="animate-pop-in shadow-solid w-full max-w-sm rounded-xl border border-border bg-card p-6"
        style={{ "--shadow-solid-color": "var(--main-palette-strawberry-2)" } as React.CSSProperties}
      >
        <div className="flex flex-col items-center text-center">
          <StrawberryIcon className="size-12" />
          <p className="serif-italic subtitle-chip mt-3 text-sm text-main-dark/80">
            Sweet little wins
          </p>
          <h1 className="font-display heading-shadow mt-2 text-2xl text-main-dark">Goalberry</h1>
        </div>

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
          </div>

          <Button
            className="bouncy-press w-full"
            disabled={busy || !email || !password}
            onClick={() => void submit()}
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </Button>

          <Button
            variant="outline"
            className="bouncy-press w-full"
            onClick={() => void google()}
          >
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
        </div>
      </div>
    </div>
  );
}
