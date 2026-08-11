import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageShell } from "@/components/PageShell";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { totalPoints, useHabits } from "@/lib/habits";
import { useRewards } from "@/lib/rewards";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Goalberry habit tracker" },
      {
        name: "description",
        content: "Set rewards, track how many points you still need and redeem them when full.",
      },
      { property: "og:title", content: "Rewards — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Turn habit points into rewards you actually want.",
      },
    ],
  }),
  component: Rewards,
});

function Rewards() {
  const { habits } = useHabits();
  const { rewards, loaded, createReward, deleteReward } = useRewards();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [points, setPoints] = useState("100");

  const earned = totalPoints(habits);
  const canSave = name.trim().length > 0 && Number(points) > 0;

  return (
    <PageShell
      title="Rewards"
      subtitle={
        <p className="serif-italic flex items-center gap-1.5 text-sm text-main-dark/70">
          <StrawberryIcon className="size-4" />
          {earned} points earned
        </p>
      }
      action={
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Create reward
        </Button>
      }
    >
      <section className="mt-6 space-y-3">
        {loaded && rewards.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-7" />
            <h2 className="mt-3 font-medium text-main-dark">No rewards yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create something worth working towards.
            </p>
          </div>
        )}

        {rewards.map((reward) => {
          const progress = Math.min(1, reward.points > 0 ? earned / reward.points : 0);
          const remaining = Math.max(0, reward.points - earned);
          return (
            <article
              key={reward.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
              style={{ borderLeft: `4px solid var(--main-palette-strawberry-3)` }}
            >
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-main-dark">{reward.name}</h3>
                  <p className="mt-0.5 text-xs text-main-dark/70">
                    {remaining > 0 ? `${remaining} points left` : `${reward.points} points`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${reward.name}`}
                  className="text-destructive"
                  onClick={() => deleteReward(reward.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className="h-full rounded-md transition-all duration-500"
                  style={{
                    width: `${progress * 100}%`,
                    backgroundColor: "var(--main-palette-strawberry-5)",
                  }}
                />
              </div>

              {progress >= 1 && (
                <p className="serif-italic mt-2 text-xs text-main-dark/60">~ can redeem</p>
              )}
            </article>
          );
        })}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Create reward</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div className="space-y-2">
              <Label htmlFor="reward-name">Name</Label>
              <Input
                id="reward-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Movie night"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward-points">Points needed</Label>
              <Input
                id="reward-points"
                type="number"
                min={1}
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              onClick={() => {
                createReward({ name, points: Number(points) });
                setName("");
                setPoints("100");
                setOpen(false);
              }}
            >
              Create reward
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
