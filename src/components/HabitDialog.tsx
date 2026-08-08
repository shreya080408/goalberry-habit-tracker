import { useEffect, useState } from "react";
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
import { DAY_LABELS, DAY_NAMES, HABIT_COLORS, type Habit } from "@/lib/habits";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (values: { name: string; days: number[]; color: string }) => void;
};

export function HabitDialog({ open, onOpenChange, habit, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [color, setColor] = useState<string>(HABIT_COLORS[0]!);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setDays(habit?.days ?? [0, 1, 2, 3, 4, 5, 6]);
    setColor(habit?.color ?? HABIT_COLORS[0]!);
  }, [open, habit]);

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const canSave = name.trim().length > 0 && days.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{habit ? "Edit habit" : "New habit"}</DialogTitle>
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
                    "size-10 rounded-full border text-sm font-medium transition-colors",
                    days.includes(i)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-accent",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-3">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-8 rounded-full ring-offset-2 ring-offset-background transition-all",
                    color === c && "ring-2 ring-foreground",
                  )}
                  style={{ backgroundColor: c }}
                />
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
              onSubmit({ name, days, color: color ?? HABIT_COLORS[0]! });
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
