import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { PlusIcon, StreakIcon } from "@/components/icons/PhaseIcons";
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
  pointsFor,
  useHabits,
  type Habit,
} from "@/lib/habits";

export const Route = createFileRoute("/_authenticated/habits")({
  head: () => ({
    meta: [
      { title: "All Habits — Goalberry habit tracker" },
      {
        name: "description",
        content: "Every habit you track, with its schedule, difficulty, points and current streak.",
      },
      { property: "og:title", content: "All Habits — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Review and edit every habit: schedule, difficulty, points and streak.",
      },
    ],
  }),
  component: AllHabits,
});

function AllHabits() {
  const { habits, loaded, createHabit, updateHabit, deleteHabit } = useHabits();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Habit | null>(null);

  return (
    <PageShell
      title="All Habits"
      subtitle={<p className="subtitle-mono text-sm text-main-dark/70">Everything you track</p>}
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <PlusIcon className="size-4" />
          Create habit
        </Button>
      }
    >
      <section className="mt-6 space-y-4">
        {loaded && habits.length === 0 && (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-7" />
            <h2 className="mt-3 font-medium text-main-dark">No habits yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first habit to get started.
            </p>
          </div>
        )}

        {habits.map((habit) => {
          const accent = difficultyColor(habit.difficulty);
          return (
            <article
              key={habit.id}
              className="shadow-solid flex items-center gap-3 rounded-lg bg-card p-4"
              style={{ "--shadow-solid-color": accent } as React.CSSProperties}
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
                <p className="mt-1 text-xs text-main-dark/70">
                  Difficulty {habit.difficulty} · {pointsFor(habit.difficulty)} pts
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-main-dark/80">
                  <StreakIcon
                    className="size-3.5"
                    style={{ color: "var(--main-palette-strawberry-2)" }}
                  />
                  {currentStreak(habit)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Edit ${habit.name}`}
                onClick={() => {
                  setEditing(habit);
                  setOpen(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Delete ${habit.name}`}
                className="text-destructive"
                onClick={() => setDeleteTarget(habit)}
              >
                <Trash2 className="size-4" />
              </Button>
            </article>
          );
        })}
      </section>


      <HabitDialog
        open={open}
        onOpenChange={setOpen}
        habit={editing}
        onSubmit={(values) => (editing ? updateHabit(editing.id, values) : createHabit(values))}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete this habit?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deleteTarget?.name}</strong> and all its completions, skips and streak
              history will be permanently deleted. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteTarget) deleteHabit(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
