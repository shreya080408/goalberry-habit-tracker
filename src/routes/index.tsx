import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame, Plus } from "lucide-react";
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
import { HabitDialog } from "@/components/HabitDialog";
import { PageShell } from "@/components/PageShell";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import {
  DAY_LABELS,
  currentStreak,
  difficultyColor,
  isDone,
  isScheduled,
  isSkipped,
  skipCost,
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
  const [skipTarget, setSkipTarget] = useState<Habit | null>(null);

  const today = new Date();

  const todays = useMemo(() => habits.filter((h) => isScheduled(h, today)), [habits]);
  const done = todays.filter((h) => isDone(h, today) || isSkipped(h, today)).length;
  const progress = todays.length === 0 ? 0 : done / todays.length;

  return (
    <PageShell
      title="Today's Habits"
      subtitle={
        <p className="serif-italic text-sm text-main-dark/70">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      }
      action={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Create habit
        </Button>
      }
    >
      {todays.length > 0 && (
        <div className="mt-6 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-md bg-muted">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${progress * 100}%`,
                backgroundColor: "var(--main-palette-strawberry-5)",
              }}
            />
          </div>
          <span className="serif-italic text-sm text-main-dark">
            {Math.round(progress * 100)}%
          </span>
        </div>
      )}

      <section className="mt-6 space-y-4">
        {loaded && todays.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
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
          const accent = difficultyColor(habit.difficulty);
          return (
            <article
              key={habit.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              style={{
                borderLeft: `4px solid ${accent}`,
                boxShadow: `-5px 5px 0 0 color-mix(in oklab, ${accent} 28%, transparent)`,
              }}
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-main-dark">{habit.name}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-1.5">
                  {DAY_LABELS.map((label, i) => (
                    <span
                      key={i}
                      className="flex size-5 items-center justify-center rounded-[5px] text-[10px] font-semibold"
                      style={
                        habit.days.includes(i)
                          ? { backgroundColor: accent, color: "var(--main-light)" }
                          : { backgroundColor: "var(--muted)", color: "var(--muted-foreground)" }
                      }
                    >
                      {label}
                    </span>
                  ))}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-main-dark/80">
                  <Flame
                    className="size-3.5"
                    style={{ color: "var(--main-palette-strawberry-2)" }}
                    fill="var(--main-palette-strawberry-3)"
                  />
                  {streak}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="sm"
                  aria-pressed={completed}
                  onClick={() => toggleCompletion(habit.id, today)}
                  className="rounded-lg text-main-dark hover:opacity-90"
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
                  className="rounded-lg text-main-light hover:opacity-90"
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
    </PageShell>
  );
}
