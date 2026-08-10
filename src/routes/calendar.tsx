import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/PageShell";
import { cn } from "@/lib/utils";
import { DAY_LABELS, dayBreakdown, difficultyColor, useHabits } from "@/lib/habits";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Calendar — Goalberry habit tracker" },
      {
        name: "description",
        content:
          "Browse a monthly calendar and tap any day to see completed, skipped and incomplete habits.",
      },
      { property: "og:title", content: "Calendar — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "A month at a glance: completed, skipped and missed habits per day.",
      },
    ],
  }),
  component: CalendarPage;
});

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function CalendarPage() {
  const { habits } = useHabits();
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(today);

  const cells = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const lead = first.getDay();
    return [
      ...Array.from({ length: lead }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
      ),
    ];
  }, [cursor]);

  const detail = dayBreakdown(habits, selected);

  return (
    <PageShell
      title="Calendar"
      subtitle={<p className="serif-italic text-sm text-main-dark/70">A month at a glance</p>}
    >
      <section className="mt-6 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Previous month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <h2 className="font-display text-lg text-main-dark">
            {cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Next month"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[11px] text-main-dark/60">
          {DAY_LABELS.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`e${i}`} />;
            const { scheduled, rate } = dayBreakdown(habits, date);
            const isSelected = sameDay(date, selected);
            return (
              <button
                key={date.toISOString()}
                type="button"
                onClick={() => setSelected(date)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border text-sm transition-colors",
                  isSelected
                    ? "border-main-dark bg-accent/40 font-semibold text-main-dark"
                    : "border-transparent text-main-dark/80 hover:bg-accent/25",
                  sameDay(date, today) && !isSelected && "border-border",
                )}
              >
                {date.getDate()}
                <span
                  className="h-1 w-5 rounded-full"
                  style={{
                    backgroundColor:
                      scheduled.length === 0
                        ? "transparent"
                        : rate === 1
                          ? "var(--main-palette-strawberry-5)"
                          : rate > 0
                            ? "var(--main-palette-strawberry-3)"
                            : "var(--muted)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-lg text-main-dark">
          {selected.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h2>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-md bg-muted">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${detail.rate * 100}%`,
                backgroundColor: "var(--main-palette-strawberry-5)",
              }}
            />
          </div>
          <span className="serif-italic text-sm text-main-dark">
            {Math.round(detail.rate * 100)}%
          </span>
        </div>

        {detail.scheduled.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">No habits scheduled on this day.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {(
              [
                ["Completed", detail.completed, "var(--main-palette-strawberry-4)"],
                ["Skipped", detail.skipped, "var(--main-palette-strawberry-1)"],
                ["Incomplete", detail.incomplete, "var(--main-palette-strawberry-2)"],
              ] as const
            ).map(([label, list, color]) => (
              <div key={label}>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-main-dark/60">
                  {label} ({list.length})
                </h3>
                <ul className="mt-1.5 space-y-1.5">
                  {list.length === 0 && <li className="text-sm text-muted-foreground">—</li>}
                  {list.map((habit) => (
                    <li
                      key={habit.id}
                      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-main-dark"
                      style={{ borderLeft: `4px solid ${color}` }}
                    >
                      <span
                        className="size-2.5 rounded-[3px]"
                        style={{ backgroundColor: difficultyColor(habit.difficulty) }}
                      />
                      {habit.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageShell>
  );
}
