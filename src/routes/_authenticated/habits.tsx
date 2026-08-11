import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Flame, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <PageShell
      title="All Habits"
      subtitle={<p className="serif-italic text-sm text-main-dark/70">Everything you track</p>}
      action={
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Create habit
        </Button>
      }
    >
      <section className="mt-6 space-y-4">
        {loaded && habits.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
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
                <p className="mt-1 text-xs text-main-dark/70">
                  Difficulty {habit.difficulty} · {pointsFor(habit.difficulty)} pts
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs font-medium text-main-dark/80">
                  <Flame
                    className="size-3.5"
                    style={{ color: "var(--main-palette-strawberry-2)" }}
                    fill="var(--main-palette-strawberry-3)"
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
                onClick={() => deleteHabit(habit.id)}
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
    </PageShell>
  );
}
