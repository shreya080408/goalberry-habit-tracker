import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HabitCard } from "@/components/HabitCard";
import { HabitDialog } from "@/components/HabitDialog";
import { isScheduled, toDateKey, useHabits, type Habit } from "@/lib/habits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Habit Tracker — Build daily routines that stick" },
      {
        name: "description",
        content:
          "A simple habit tracker: create habits, pick the days you repeat them, check them off daily and keep your streak alive.",
      },
      { property: "og:title", content: "Habit Tracker — Build daily routines that stick" },
      {
        property: "og:description",
        content: "Create habits, choose your days, and check off completions each day.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { habits, loaded, createHabit, updateHabit, deleteHabit, toggleCompletion } = useHabits();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Habit | null>(null);

  const today = new Date();
  const todayKey = toDateKey(today);

  const { due, done } = useMemo(() => {
    const dueList = habits.filter((h) => isScheduled(h, today));
    return {
      due: dueList.length,
      done: dueList.filter((h) => h.completions.includes(todayKey)).length,
    };
  }, [habits, todayKey]);

  const openNew = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
        <header className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm italic text-muted-foreground">
              {today.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
            <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight text-foreground">Today's Habits</h1>
            {due > 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                {done} of {due} done today
              </p>
            )}
          </div>
          <Button onClick={openNew}>
            <Plus className="size-4" />
            New habit
          </Button>
        </header>

        {due > 0 && (
          <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(done / due) * 100}%` }}
            />
          </div>
        )}

        <section className="mt-6 space-y-4">
          {loaded && habits.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <Sparkles className="mx-auto size-6 text-muted-foreground" />
              <h2 className="mt-3 font-medium text-foreground">No habits yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Add your first habit and pick the days you want to repeat it.
              </p>
              <Button className="mt-5" variant="secondary" onClick={openNew}>
                <Plus className="size-4" />
                Create a habit
              </Button>
            </div>
          )}

          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={(date) => toggleCompletion(habit.id, date)}
              onEdit={() => {
                setEditing(habit);
                setDialogOpen(true);
              }}
              onDelete={() => deleteHabit(habit.id)}
            />
          ))}
        </section>
      </div>

      <HabitDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        habit={editing}
        onSubmit={(values) => (editing ? updateHabit(editing.id, values) : createHabit(values))}
      />
    </main>
  );
}
