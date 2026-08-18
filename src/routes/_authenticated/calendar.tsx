import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckIcon, ForwardArrowIcon } from "@/components/icons/PhaseIcons";
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
import { PageShell } from "@/components/PageShell";
import { ProgressBar } from "@/components/ProgressBar";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  dayBreakdown,
  difficultyColor,
  isDone,
  isSkipped,
  skipCost,
  useHabits,
  usePoints,
  type Habit,
} from "@/lib/habits";

export const Route = createFileRoute("/_authenticated/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Goalberry habit tracker" },
      {
        name: "description",
        content:
          "Browse a monthly calendar and tap any day to see and mark completed, skipped and incomplete habits.",
      },
      { property: "og:title", content: "Calendar — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Your month at a glance: completed, skipped and missed habits per day.",
      },
    ],
  }),
  component: CalendarPage,
});

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

const cardShadow = {
  "--shadow-solid-color": "var(--main-palette-strawberry-2)",
} as React.CSSProperties;

function CalendarPage() {
  const { habits, toggleCompletion, toggleSkip } = useHabits();
  const points = usePoints();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);
  const [skipTarget, setSkipTarget] = useState<Habit | null>(null);
  const [brokeError, setBrokeError] = useState(false);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
      ),
    ];
  }, [cursor]);

  const detail = dayBreakdown(habits, selected);

  const requestSkip = (habit: Habit) => {
    if (points < skipCost(habit.difficulty)) {
      setBrokeError(true);
      return;
    }
    setSkipTarget(habit);
  };

  return (
    <PageShell
      title="Calendar"
      subtitle={
        <p className="subtitle-mono subtitle-chip text-sm text-main-dark/80">
          Your monthly wins
        </p>
      }
    >
      <section
        className="shadow-solid mt-6 rounded-lg bg-card p-3"
        style={cardShadow}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ForwardArrowIcon className="size-4 rotate-180" />
          </Button>
          <h2 className="font-display text-base text-main-dark">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ForwardArrowIcon className="size-4" />
          </Button>
        </div>

        <div className="mx-auto mt-3 max-w-xs">
          <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] text-main-dark/60">
            {DAY_LABELS.map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-0.5">
            {cells.map((date, i) => {
              if (!date) return <span key={`e${i}`} />;
              const { scheduled, rate } = dayBreakdown(habits, date);
              const isSelected = sameDay(date, selected);
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelected(date)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border text-xs transition-colors",
                    isSelected
                      ? "border-main-dark bg-accent/40 font-semibold text-main-dark"
                      : "border-transparent text-main-dark/80 hover:bg-accent/25",
                    sameDay(date, today) && !isSelected && "border-border",
                  )}
                >
                  {date.getDate()}
                  <span className="h-1.5 w-7 overflow-hidden bg-main-palette-strawberry-1">
                    {scheduled.length > 0 && (
                      <span
                        className="block h-full"
                        style={{
                          width: `${Math.round(rate * 100)}%`,
                          backgroundColor: "var(--main-palette-strawberry-4)",
                        }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="shadow-solid mt-6 rounded-lg bg-card p-5"
        style={cardShadow}
      >
        <h2 className="font-display text-center text-lg text-main-dark">
          {selected.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h2>

        <div className="mt-3">
          <ProgressBar value={detail.rate} showLabel />
        </div>

        {detail.scheduled.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No habits scheduled on this day.</p>
        ) : (
          <>
            {(
              [
                ["Completed", detail.completed],
                ["Incomplete", detail.incomplete],
                ["Skipped", detail.skipped],
              ] as const
            ).map(([label, habitsInGroup]) =>
              habitsInGroup.length === 0 ? null : (
                <section key={label} className="mt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-main-dark/60">
                    {label}
                  </h3>
                  <ul className="mt-2 space-y-2.5">
                    {habitsInGroup.map((habit) => {
                      const completed = isDone(habit, selected);
                      const skipped = isSkipped(habit, selected);
                      const accent = difficultyColor(habit.difficulty);
                      return (
                        <li
                          key={habit.id}
                          className="flex items-center gap-3 rounded-lg border-4 px-3 py-2"
                          style={{ borderColor: accent }}
                        >
                          <span className="min-w-0 flex-1 truncate text-sm text-main-dark">
                            {habit.name}
                          </span>
                          <div className="flex shrink-0 items-center gap-2">
                            {completed ? (
                              <button
                                type="button"
                                aria-label={`Unmark ${habit.name}`}
                                onClick={() => toggleCompletion(habit.id, selected)}
                                className="bouncy-press flex size-8 items-center justify-center rounded-lg"
                                style={{ backgroundColor: "var(--main-palette-strawberry-5)" }}
                              >
                                <CheckIcon className="size-4 text-main-light" />
                              </button>
                            ) : (
                              <Button
                                size="sm"
                                disabled={skipped}
                                onClick={() => toggleCompletion(habit.id, selected)}
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
                              onClick={() =>
                                skipped ? void toggleSkip(habit.id, selected) : requestSkip(habit)
                              }
                              className="bouncy-press rounded-lg text-main-light hover:opacity-90"
                              style={{
                                backgroundColor: "var(--main-palette-strawberry-1)",
                                opacity: skipped ? 1 : 0.85,
                              }}
                            >
                              {skipped ? "Skipped" : "Skip"}
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ),
            )}
          </>
        )}
      </section>

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
                  void toggleSkip(skipTarget.id, selected).catch(() => setBrokeError(true));
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
