import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/profile";
import { chooseGuest, clearGuest, useSession } from "@/lib/session";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Goalberry" },
      {
        name: "description",
        content: "Your Goalberry account, sign-in options and analytics preferences.",
      },
      { property: "og:title", content: "Settings — Goalberry" },
      { property: "og:description", content: "Account details and analytics preferences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const cardStyle = {
  "--shadow-solid-color": "var(--main-palette-strawberry-2)",
} as React.CSSProperties;

function SettingsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { session, isGuest } = useSession();
  const { includeSkips, setIncludeSkips } = useProfile();
  const [deleting, setDeleting] = useState(false);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    chooseGuest();
    void navigate({ to: "/auth", replace: true });
  };

  const deleteAccount = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.rpc("delete_own_account");
      if (error) throw error;
      await qc.cancelQueries();
      qc.clear();
      await supabase.auth.signOut();
      chooseGuest();
      toast.success("Your account and all its data have been deleted.");
      void navigate({ to: "/auth", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't delete your account.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell
      title="Settings"
      subtitle={
        <p className="subtitle-mono subtitle-chip text-sm text-main-dark/80">
          Your account
        </p>
      }
    >
      <div
        className="shadow-solid mt-8 space-y-4 rounded-lg bg-card p-5"
        style={cardStyle}
      >
        {isGuest ? (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-main-dark/60">Account</p>
              <p className="text-base font-semibold text-main-dark">Using Goalberry as a guest</p>
              <p className="mt-1 text-sm text-main-dark/70">
                Everything is stored on this device. Sign in and it all moves to your account
                automatically.
              </p>
            </div>
            <Button
              className="bouncy-press"
              onClick={() => {
                clearGuest();
                void navigate({ to: "/auth" });
              }}
            >
              Sign in or create an account
            </Button>
          </>
        ) : (
          <>
            <div>
              <p className="text-xs uppercase tracking-wide text-main-dark/60">Signed in as</p>
              <p className="text-base font-semibold text-main-dark">{session?.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-main-dark/60">Sign-in method</p>
              <p className="text-base font-semibold capitalize text-main-dark">
                {session?.provider ?? "—"}
              </p>
            </div>
            <Button variant="outline" className="bouncy-press" onClick={() => void signOut()}>
              Sign out
            </Button>
          </>
        )}
      </div>

      <div
        className="shadow-solid mt-6 rounded-lg bg-card p-5"
        style={cardStyle}
      >
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="include-skips" className="text-sm text-main-dark">
            Include skips in success rates
          </Label>
          <Switch id="include-skips" checked={includeSkips} onCheckedChange={setIncludeSkips} />
        </div>
      </div>

      {!isGuest && (
        <div
          className="shadow-solid mt-6 space-y-3 rounded-lg bg-card p-5"
          style={cardStyle}
        >
          <div>
            <p className="text-xs uppercase tracking-wide text-destructive/80">Danger zone</p>
            <p className="mt-1 text-sm text-main-dark/70">
              Permanently delete your account and all your habits, streaks and rewards. This
              can't be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bouncy-press">
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes your account, along with every habit, streak, reward
                  and completion tied to it. This action can't be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={deleting}
                  onClick={(e) => {
                    e.preventDefault();
                    void deleteAccount();
                  }}
                >
                  {deleting ? "Deleting…" : "Delete my account"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </PageShell>
  );
}
