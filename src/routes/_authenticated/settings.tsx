import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Goalberry" },
      { name: "description", content: "View your Goalberry account details and sign out." },
      { property: "og:title", content: "Settings — Goalberry" },
      { property: "og:description", content: "Your Goalberry account details." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [since, setSince] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setSince(data.user?.created_at ?? null);
    });
  }, []);

  return (
    <PageShell
      title="Settings"
      subtitle={
        <p className="serif-italic subtitle-chip text-sm font-semibold text-main-dark/80">
          Your account
        </p>
      }
    >
      <div
        className="shadow-solid mt-8 space-y-4 rounded-xl border border-border bg-card p-5"
        style={{ "--shadow-solid-color": "var(--main-palette-strawberry-2)" } as React.CSSProperties}
      >
        <div>
          <p className="text-xs uppercase tracking-wide text-main-dark/60">Signed in as</p>
          <p className="text-base font-semibold text-main-dark">{email ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-main-dark/60">Member since</p>
          <p className="text-base font-semibold text-main-dark">
            {since ? new Date(since).toLocaleDateString() : "—"}
          </p>
        </div>
        <Button
          variant="outline"
          className="bouncy-press"
          onClick={async () => {
            await supabase.auth.signOut();
            void navigate({ to: "/auth" });
          }}
        >
          Sign out
        </Button>
      </div>
    </PageShell>
  );
}
