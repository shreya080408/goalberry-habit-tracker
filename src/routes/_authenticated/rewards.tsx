import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PlusIcon } from "@/components/icons/PhaseIcons";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageShell } from "@/components/PageShell";
import { ProgressBar } from "@/components/ProgressBar";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { usePoints } from "@/lib/habits";
import { useRewards, type Reward } from "@/lib/rewards";

export const Route = createFileRoute("/_authenticated/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Goalberry habit tracker" },
      {
        name: "description",
        content: "Set rewards, track how many points you still need and claim them when full.",
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

const cardShadow = {
  "--shadow-solid-color": "var(--main-palette-strawberry-2)",
} as React.CSSProperties;

function Rewards() {
  const balance = usePoints();
  const { open: openRewards, claimed, loaded, createReward, updateReward, deleteReward, claimReward } =
    useRewards();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Reward | null>(null);
  const [name, setName] = useState("");
  const [points, setPoints] = useState("100");
  const [claimTarget, setClaimTarget] = useState<Reward | null>(null);

  const canSave = name.trim().length > 0 && Number(points) > 0;

  const startCreate = () => {
    setEditing(null);
    setName("");
    setPoints("100");
    setDialogOpen(true);
  };

  const startEdit = (reward: Reward) => {
    setEditing(reward);
    setName(reward.name);
    setPoints(String(reward.points));
    setDialogOpen(true);
  };

  return (
    <PageShell
      title="Rewards"
      subtitle={
        <p className="subtitle-mono subtitle-chip text-sm text-main-dark/80">
          Your own source of motivation
        </p>
      }
      action={
        <Button className="bouncy-press" onClick={startCreate}>
          <PlusIcon className="size-4" />
          Create reward
        </Button>
      }
    >
      <section className="mt-6 space-y-4">
        {loaded && openRewards.length === 0 && claimed.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-7" />
            <h2 className="mt-3 font-medium text-main-dark">No rewards yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create something worth working towards.
            </p>
          </div>
        )}

        {openRewards.map((reward) => {
          const progress = reward.points > 0 ? balance / reward.points : 0;
          const remaining = Math.max(0, reward.points - balance);
          return (
            <article
              key={reward.id}
              className="shadow-solid rounded-lg bg-card p-4"
              style={cardShadow}
            >
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-main-dark">{reward.name}</h3>
                  <p className="mt-0.5 text-xs text-main-dark/70">
                    {remaining > 0 ? `${remaining} points left` : `${reward.points} points`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Edit ${reward.name}`}
                  onClick={() => startEdit(reward)}
                >
                  <Pencil className="size-4" />
                </Button>
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

              <div className="mt-3">
                <ProgressBar value={progress} showLabel />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                {progress >= 1 && (
                  <p className="subtitle-mono text-xs text-main-dark/70">~ can redeem</p>
                )}
                <Button
                  size="sm"
                  disabled={balance < reward.points}
                  onClick={() => setClaimTarget(reward)}
                  className="bouncy-press ml-auto rounded-lg text-main-light hover:opacity-90"
                  style={{ backgroundColor: "var(--main-palette-strawberry-5)" }}
                >
                  Claim
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      {claimed.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg text-main-dark">Claimed rewards</h2>
          <div className="mt-4 space-y-3">
            {claimed.map((reward) => (
              <article
                key={reward.id}
                className="shadow-solid flex items-center gap-3 rounded-lg bg-card p-4 opacity-90"
                style={cardShadow}
              >
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-medium text-main-dark">{reward.name}</h3>
                  <p className="subtitle-mono mt-0.5 text-xs text-main-dark/70">
                    claimed{" "}
                    {new Date(reward.claimedAt!).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <span className="font-stat text-sm font-semibold text-main-dark">
                  -{reward.points}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${reward.name}`}
                  className="text-destructive"
                  onClick={() => deleteReward(reward.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </article>
            ))}
          </div>
        </section>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editing ? "Edit reward" : "Create reward"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-5 py-1">
            <div className="space-y-3">
              <Label
                htmlFor="reward-name"
                className="w-fit border-b-2 border-main-dark pb-1 font-semibold text-main-dark"
              >
                Name:
              </Label>
              <Input
                id="reward-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Movie night"
                autoFocus
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="reward-points"
                className="w-fit border-b-2 border-main-dark pb-1 font-semibold text-main-dark"
              >
                Points needed:
              </Label>
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
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              onClick={() => {
                if (editing) {
                  updateReward({ id: editing.id, name, points: Number(points) });
                } else {
                  createReward({ name, points: Number(points) });
                }
                setDialogOpen(false);
                setEditing(null);
              }}
            >
              {editing ? "Save changes" : "Create reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!claimTarget} onOpenChange={(o) => !o && setClaimTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Claim this reward?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{claimTarget?.points ?? 0} points</strong> will be deducted and{" "}
              {claimTarget?.name} moves to your claimed rewards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (claimTarget) void claimReward(claimTarget.id).catch(() => undefined);
                setClaimTarget(null);
              }}
            >
              Confirm claim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
