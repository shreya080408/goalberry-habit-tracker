import { Check, Flame, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  currentStreak,
  isScheduled,
  lastSevenDays,
  toDateKey,
  type Habit,
} from "@/lib/habits";

type Props = {
  habit: Habit;
  onToggle: (date: Date) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function HabitCard({ habit, onToggle, onEdit, onDelete }: Props) {
  const week = lastSevenDays();
  const today = new Date();
  const todayKey = toDateKey(today);
  const doneToday = habit.completions.includes(todayKey);
  const dueToday = isScheduled(habit, today);
  const streak = currentStreak(habit);

  return (
    <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-1.5 size-3 shrink-0 rounded-full"
          style={{ backgroundColor: habit.color }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground">{habit.name}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {habit.days.length === 7
              ? "Every day"
              : habit.days.map((d) => DAY_LABELS[d]).join(" · ")}
            {streak > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-foreground">
                <Flame className="size-3" /> {streak}
              </span>
            )}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Habit options">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive" onClick={onDelete}>
              <Trash2 className="size-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        {week.map((date) => {
          const key = toDateKey(date);
          const scheduled = isScheduled(habit, date);
          const done = habit.completions.includes(key);
          const isToday = key === todayKey;
          return (
            <button
              key={key}
              type="button"
              disabled={!scheduled}
              onClick={() => onToggle(date)}
              aria-label={`${habit.name} on ${date.toDateString()}`}
              aria-pressed={done}
              className={cn(
                "flex flex-1 flex-col items-center gap-1.5 rounded-lg py-1.5 transition-colors",
                scheduled ? "hover:bg-accent" : "opacity-35",
              )}
            >
              <span className="text-[10px] font-medium uppercase text-muted-foreground">
                {DAY_LABELS[date.getDay()]}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border text-xs",
                  done ? "border-transparent" : "border-border",
                  isToday && !done && "border-foreground",
                )}
                style={done ? { backgroundColor: habit.color } : undefined}
              >
                {done ? <Check className="size-4 text-background" /> : date.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        className="mt-4 w-full"
        variant={doneToday ? "secondary" : "default"}
        disabled={!dueToday}
        onClick={() => onToggle(today)}
      >
        {!dueToday ? "Not scheduled today" : doneToday ? "Completed today" : "Mark complete"}
      </Button>
    </article>
  );
}
