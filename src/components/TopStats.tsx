import { useState } from "react";
import { Flame } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import {
  DIFFICULTY_LEVELS,
  bestStreak,
  difficultyColor,
  pointsFor,
  skipCost,
  usePoints,
  useHabits,
} from "@/lib/habits";

/**
 * Persistent top-right cluster: overall streak counter + points counter.
 */
export function TopStats() {
  const { habits } = useHabits();
  const points = usePoints();
  const [open, setOpen] = useState(false);
  const streak = bestStreak(habits);

  return (
    <>
      <div className="flex items-center gap-2">
        <span
          aria-label={`Overall streak: ${streak} days`}
          className="bouncy-press flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-main-dark"
          style={{ "--shadow-solid-color": "var(--main-palette-strawberry-3)" } as React.CSSProperties}
        >
          <Flame
            className="size-4"
            style={{ color: "var(--main-palette-strawberry-2)" }}
            fill="var(--main-palette-strawberry-3)"
          />
          {streak}
        </span>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Points system"
          className="bouncy-press flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-main-dark"
        >
          <StrawberryIcon className="size-4" />
          {points}
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Points system</DialogTitle>
            <DialogDescription>
              Every completed habit awards points based on its difficulty. Skipping a habit keeps
              your streak but costs 5x those points.
            </DialogDescription>
          </DialogHeader>
          <ul className="space-y-2">
            {DIFFICULTY_LEVELS.map((level) => (
              <li
                key={level}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm text-main-dark">
                  <span
                    className="size-4 rounded-[4px]"
                    style={{ backgroundColor: difficultyColor(level) }}
                  />
                  Difficulty {level}
                </span>
                <span className="text-sm font-semibold text-main-dark">
                  +{pointsFor(level)} (skip −{skipCost(level)})
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TopStats;
