import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { HabitDialog } from "@/components/HabitDialog";
import { PageShell } from "@/components/PageShell";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import {
  DIFFICULTY_LEVELS,
  currentStreak,
  difficultyColor,
  isDone,
  isScheduled,
  isSkipped,
  pointsFor,
  skipCost,
  totalPoints,
  useHabits,
  type Habit,
} from "@/lib/habits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today's Habits — Goalberry habit tracker" },
      {
        name: "description",
        content:
          "See the habits due today, mark them done or skip them, keep your streak alive and earn points.",
      },
      { property: "og:title", content: "Today's Habits — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Track today's habits, keep streaks alive and earn points towards rewards.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { habits, loaded, createHabit, toggleCompletion, toggleSkip } = useHabits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pointsOpen, setPointsOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<Habit | null>(null);

  const today = new Date();

  const todays = useMemo(() => habits.filter((h) => isScheduled(h, today)), [habits]);
  const done = todays.filter((h) => isDone(h, today) || isSkipped(h, today)).length;
  const points = totalPoints(habits);

  return (
    <PageShell
      title="Today's Habits"
      subtitle={
        <p className="text-sm italic text-muted-foreground">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      }
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPointsOpen(true)}
            aria-label="How points work"
            className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-semibold text-main-dark transition-colors hover:bg-accent"
          >
            <StrawberryIcon className="size-4" />
            {points}
          </button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="size-4" />
            Create habit
          </Button>
        </div>
      }
    >
      {todays.length > 0 && (
        <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(done / todays.length) * 100}%`,
              backgroundColor: "var(--main-palette-strawberry-5)",
            }}
          />
        </div>
      )}

      <section className="mt-6 space-y-3">
        {loaded && todays.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-7" />
            <h2 className="mt-3 font-medium text-main-dark">Nothing due today</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a habit and pick the days you want to repeat it.
            </p>
            <Button className="mt-5" variant="secondary" onClick={() => setDialogOpen(true)}>
              <Plus className="size-4" />
              Create habit
            </Button>
          </div>
        )}

        {todays.map((habit) => {
          const completed = isDone(habit, today);
          const skipped = isSkipped(habit, today);
          const streak = currentStreak(habit);
          return (
            <article
              key={habit.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
              style={{ borderLeft: `4px solid var(--main-palette-strawberry-2)` }}
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-main-dark">{habit.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-main-dark/70">
                  <StrawberryIcon className="size-3.5" />
                  {streak}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  aria-pressed={completed}
                  onClick={() => toggleCompletion(habit.id, today)}
                  className="text-main-dark hover:opacity-90"
                  style={{
                    backgroundColor: "var(--main-palette-strawberry-4)",
                    opacity: completed ? 1 : 0.75,
                  }}
                >
                  {completed ? "Done ✓" : "Done"}
                </Button>
                <Button
                  size="sm"
                  aria-pressed={skipped}
                  onClick={() => (skipped ? toggleSkip(habit.id, today) : setSkipTarget(habit))}
                  className="text-main-light hover:opacity-90"
                  style={{
                    backgroundColor: "var(--main-palette-strawberry-1)",
                    opacity: skipped ? 1 : 0.75,
                  }}
                >
                  {skipped ? "Skipped" : "Skip"}
                </Button>
              </div>
            </article>
          );
        })}
      </section>

      <HabitDialog open={dialogOpen} onOpenChange={setDialogOpen} onSubmit={createHabit} />

      <AlertDialog open={!!skipTarget} onOpenChange={(o) => !o && setSkipTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Skip this habit?</AlertDialogTitle>
            <AlertDialogDescription>
              A skip costs 5x the points this habit would award —{" "}
              <strong>{skipTarget ? skipCost(skipTarget.difficulty) : 0} points</strong> will be
              deducted. Your streak stays alive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (skipTarget) toggleSkip(skipTarget.id, today);
                setSkipTarget(null);
              }}
            >
              Confirm skip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={pointsOpen} onOpenChange={setPointsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">How points work</DialogTitle>
            <DialogDescription>
              Every completed habit awards points based on its difficulty. Skipping a habit keeps
              your streak but costs 5x those points.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <li
                key={level}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-main-dark">
                  <span
                    className="size-4 rounded-full"
                    style={{ backgroundColor: difficultyColor(level) }}
                  />
                  Difficulty {level}
                </span>
                <span className="text-sm font-semibold text-main-dark">
                  +{pointsFor(level)} · skip −{skipCost(level)}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
