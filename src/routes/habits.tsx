import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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

export const Route = createFileRoute("/habits")({
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
      subtitle={<p className="text-sm italic text-muted-foreground">Everything you track</p>}
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
      <section className="mt-6 space-y-3">
        {loaded && habits.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
            <StrawberryIcon className="mx-auto size-7" />
            <h2 className="mt-3 font-medium text-main-dark">No habits yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first habit to get started.
            </p>
          </div>
        )}

        {habits.map((habit) => (
          <article
            key={habit.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm"
            style={{ borderLeft: `4px solid ${difficultyColor(habit.difficulty)}` }}
          >
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-main-dark">{habit.name}</h3>
              <p className="mt-0.5 text-xs text-main-dark/70">
                {habit.days.length === 7
                  ? "Every day"
                  : habit.days.map((d) => DAY_LABELS[d]).join(" · ")}
                {" · "}Difficulty {habit.difficulty} · {pointsFor(habit.difficulty)} pts
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-main-dark/70">
                <StrawberryIcon className="size-3.5" />
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
        ))}
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
