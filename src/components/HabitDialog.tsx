import { useEffect, useState } from "react";
import { CalendarIcon, Star } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  DAY_LABELS,
  DAY_NAMES,
  DIFFICULTY_LEVELS,
  difficultyColor,
  toDateKey,
  type Habit,
  type HabitInput,
} from "@/lib/habits";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  onSubmit: (values: HabitInput) => void;
};

function FieldLabel({ children, htmlFor }: { children: string; htmlFor?: string }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="w-fit border-b-2 border-main-dark pb-1 font-semibold text-main-dark"
    >
      {children}:
    </Label>
  );
}

export function HabitDialog({ open, onOpenChange, habit, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [difficulty, setDifficulty] = useState(3);
  const [startMode, setStartMode] = useState<"today" | "custom">("today");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!open) return;
    setName(habit?.name ?? "");
    setDescription(habit?.description ?? "");
    setDays(habit?.days ?? [0, 1, 2, 3, 4, 5, 6]);
    setDifficulty(habit?.difficulty ?? 3);
    const initialStart = habit?.startDate ? new Date(`${habit.startDate}T00:00:00`) : new Date();
    setStartDate(initialStart);
    setStartMode(!habit || habit.startDate === toDateKey(new Date()) ? "today" : "custom");
    setEndDate(habit?.endDate ? new Date(`${habit.endDate}T00:00:00`) : undefined);
  }, [open, habit]);

  const toggleDay = (d: number) =>
    setDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort()));

  const canSave = name.trim().length > 0 && days.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">{habit ? "Edit habit" : "Create habit"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-9 py-1">
          <div className="space-y-6">
            <FieldLabel htmlFor="habit-name">Name</FieldLabel>
            <Input
              id="habit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Read for 20 minutes"
              autoFocus
            />
          </div>

          <div className="space-y-6">
            <FieldLabel htmlFor="habit-desc">Desc (optional)</FieldLabel>
            <Textarea
              id="habit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why this habit matters"
              rows={2}
            />
          </div>

          <div className="space-y-6">
            <FieldLabel>Repeat on</FieldLabel>
            <div className="flex gap-2">
              {DAY_LABELS.map((label, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={DAY_NAMES[i]}
                  aria-pressed={days.includes(i)}
                  onClick={() => toggleDay(i)}
                  className={cn(
                    "bouncy-press size-10 rounded-lg border text-sm font-medium",
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

          <div className="space-y-6">
            <FieldLabel>Difficulty</FieldLabel>
            <div className="flex items-center gap-3">
              {DIFFICULTY_LEVELS.map((level) => (
                <button
                  key={level}
                  type="button"
                  aria-label={`Difficulty ${level}`}
                  aria-pressed={difficulty === level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "relative flex size-12 items-center justify-center rounded-lg transition-transform duration-300",
                    difficulty === level ? "scale-125" : "scale-90 opacity-80 hover:opacity-100",
                  )}
                  style={
                    difficulty === level
                      ? { transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)" }
                      : undefined
                  }
                >
                  <Star
                    className="size-10"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    style={{ color: difficultyColor(level), fill: difficultyColor(level) }}
                  />
                  <span className="absolute text-xs font-semibold text-main-light">{level}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <FieldLabel>Start date</FieldLabel>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={startMode === "today" ? "default" : "outline"}
                className="rounded-lg"
                onClick={() => {
                  setStartMode("today");
                  setStartDate(new Date());
                }}
              >
                Today
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={startMode === "custom" ? "default" : "outline"}
                    className="justify-start gap-2 rounded-lg"
                    onClick={() => setStartMode("custom")}
                  >
                    <CalendarIcon className="size-4" />
                    {startMode === "custom"
                      ? startDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      if (!d) return;
                      setStartDate(d);
                      setStartMode("custom");
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-6">
            <FieldLabel>End date (optional)</FieldLabel>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="justify-start gap-2 rounded-lg">
                    <CalendarIcon className="size-4" />
                    {endDate
                      ? endDate.toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "No end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
              {endDate && (
                <Button variant="ghost" size="sm" onClick={() => setEndDate(undefined)}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bouncy-press"
            disabled={!canSave}
            onClick={() => {
              onSubmit({
                name,
                description,
                days,
                difficulty,
                startDate: toDateKey(startDate),
                endDate: endDate ? toDateKey(endDate) : null,
              });
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
