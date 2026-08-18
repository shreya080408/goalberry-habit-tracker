import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CheckIcon, PlusIcon, StreakIcon } from "@/components/icons/PhaseIcons";
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
import { ProgressBar } from "@/components/ProgressBar";
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
  usePoints,
  type Habit,
} from "@/lib/habits";

export const Route = createFileRoute("/_authenticated/")({
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { habits, loaded, createHabit, toggleCompletion, toggleSkip } = useHabits();
  const points = usePoints();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [skipTarget, setSkipTarget] = useState<Habit | null>(null);
  const [brokeError, setBrokeError] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const today = new Date();

  const todays = useMemo(() => habits.filter((h) => isScheduled(h, today)), [habits]);
  const done = todays.filter((h) => isDone(h, today) || isSkipped(h, today)).length;
  const progress = todays.length === 0 ? 0 : done / todays.length;

  const requestSkip = (habit: Habit) => {
    if (points < skipCost(habit.difficulty)) {
      setBrokeError(true);
      return;
    }
    setSkipTarget(habit);
  };

  return (
    <PageShell
      title="Today's Habits"
      subtitle={
        <p className="subtitle-mono subtitle-chip text-sm text-main-dark/80">
          {today.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      }
      action={
        <Button className="bouncy-press" onClick={() => setDialogOpen(true)}>
          <PlusIcon className="size-4" />
          Create habit
        </Button>
      }
    >
      {todays.length > 0 && (
        <div className="mt-6">
          <ProgressBar value={progress} showLabel />
        </div>
      )}

      <section className="mt-6 space-y-5">
        {loaded && todays.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-8" />
            <h2 className="mt-3 font-medium text-main-dark">Nothing due today</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a habit and pick the days you want to repeat it.
            </p>
            <Button className="mt-5" variant="secondary" onClick={() => setDialogOpen(true)}>
              <PlusIcon className="size-4" />
              Create habit
            </Button>
          </div>
        )}

        {todays.map((habit) => {
          const completed = isDone(habit, today);
          const skipped = isSkipped(habit, today);
          const streak = currentStreak(habit);
          const accent = difficultyColor(habit.difficulty);
          const isOpen = !!expanded[habit.id];
          return (
            <article
              key={habit.id}
              className="shadow-solid bouncy flex items-center gap-3 rounded-lg bg-card p-4"
              style={{ "--shadow-solid-color": accent } as React.CSSProperties}
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-main-dark">{habit.name}</h3>

                {habit.description && (
                  <>
                    <button
                      type="button"
                      className="mt-0.5 flex items-center gap-1 text-xs text-main-dark/60 underline-offset-4 hover:underline"
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [habit.id]: !prev[habit.id] }))
                      }
                    >
                      show desc
                      <ChevronDown
                        className={`size-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-1 text-sm text-main-dark/80">{habit.description}</p>
                    )}
                  </>
                )}

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
                  <StreakIcon
                    className="size-3.5"
                    style={{ color: "var(--main-palette-strawberry-2)" }}
                  />
                  {streak}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {completed ? (
                  <button
                    type="button"
                    aria-label={`Unmark ${habit.name}`}
                    onClick={() => toggleCompletion(habit.id, today)}
                    className="bouncy-press flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: "var(--main-palette-strawberry-5)" }}
                  >
                    <CheckIcon className="size-5 text-main-light" />
                  </button>
                ) : (
                  <Button
                    size="sm"
                    disabled={skipped}
                    onClick={() => toggleCompletion(habit.id, today)}
                    className="bouncy-press rounded-lg text-main-light hover:opacity-90"
                    style={{ backgroundColor: "var(--main-palette-strawberry-5)" }}
                  >
                    Done
                  </Button>
                )}
                <Button
                  size="sm"
                  aria-pressed={skipped}
                  disabled={completed}
                  onClick={() => (skipped ? void toggleSkip(habit.id, today) : requestSkip(habit))}
                  className="bouncy-press rounded-lg text-main-light hover:opacity-90"
                  style={{
                    backgroundColor: "var(--main-palette-strawberry-1)",
                    opacity: skipped ? 1 : 0.85,
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
                if (skipTarget) {
                  void toggleSkip(skipTarget.id, today).catch(() => setBrokeError(true));
                }
                setSkipTarget(null);
              }}
            >
              Confirm skip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={brokeError} onOpenChange={setBrokeError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Not enough points to skip!</AlertDialogTitle>
            <AlertDialogDescription>
              Complete a few habits to earn more points, then try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setBrokeError(false)}>Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
