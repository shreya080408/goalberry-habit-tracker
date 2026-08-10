import { useEffect, useState } from "react";
import { Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { DAY_LABELS, DAY_NAMES, DIFFICULTY_LEVELS, difficultyColor, type Habit } from "@/lib/habits";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (values: { name: string; days: number[]; difficulty: number }) => void;
};

export function HabitDialog({ open, onOpenChange, habit, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [difficulty, setDifficulty] = useState(1);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setDays(habit?.days ?? [0, 1, 2, 3, 4, 5, 6]);
    setDifficulty(habit?.difficulty ?? 1);
  }, [open, habit]);

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const canSave = name.trim().length > 0 && days.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{habit ? "Edit habit" : "Create habit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name</Label>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Read for 20 minutes"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Repeat on</Label>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={DAY_NAMES[i]}
                  aria-pressed={days.includes(i)}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "size-10 rounded-lg border text-sm font-medium transition-colors",
                    days.includes(i)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent/40",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Difficulty</Label>
            <div className="flex gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-label={`Difficulty ${level}`}
                  aria-pressed={difficulty === level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "relative flex size-11 items-center justify-center rounded-lg transition-all",
                    difficulty === level
                      ? "ring-2 ring-main-dark ring-offset-2 ring-offset-background"
                      : "opacity-80 hover:opacity-100",
                  )}
                >
                  <Star
                    className="size-11"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    style={{ color: difficultyColor(level), fill: difficultyColor(level) }}
                  />
                  <span className="absolute text-xs font-semibold text-main-light">{level}</span>
                </button>
              ))}
            </div>
          </div>
        </div>


        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!canSave}
            onClick={() => {
              onSubmit({ name, days, difficulty });
              onOpenChange(false);
            }}
          >
            {habit ? "Save changes" : "Create habit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
