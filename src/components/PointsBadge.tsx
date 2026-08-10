import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { DIFFICULTY_LEVELS, difficultyColor, pointsFor, skipCost, totalPoints, useHabits } from "@/lib/habits";

export function PointsBadge() {
  const { habits } = useHabits();
  const [open, setOpen] = useState(false);
  const points = totalPoints(habits);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Points system"
        className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-main-dark shadow-sm transition-colors hover:bg-accent/40"
      >
        <StrawberryIcon className="size-4" />
        {points}
      </button>

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

export default PointsBadge;
