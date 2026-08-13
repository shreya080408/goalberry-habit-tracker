import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Flame } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageShell } from "@/components/PageShell";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";
import { cn } from "@/lib/utils";
import {
  bestStreak,
  currentStreak,
  dailySeries,
  difficultyColor,
  overallSuccessRate,
  successRate,
  useHabits,
} from "@/lib/habits";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Goalberry habit tracker" },
      {
        name: "description",
        content:
          "Overall and per-habit success rates as rings, streaks, plus weekly, monthly and yearly trends.",
      },
      { property: "og:title", content: "Analytics — Goalberry habit tracker" },
      {
        property: "og:description",
        content: "Success-rate rings, streaks and trend lines for every habit you track.",
      },
    ],
  }),
  component: Analytics,
});

const RANGES = [
  { key: "weekly", label: "Weekly", days: 7 },
  { key: "monthly", label: "Monthly", days: 30 },
  { key: "yearly", label: "Yearly", days: 365 },
] as const;

function Ring({
  value,
  color,
  size = 96,
  label,
}: {
  value: number;
  color: string;
  size?: number;
  label?: string;
}) {
  const stroke = size / 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--main-dark)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - Math.min(1, Math.max(0, value)))}
            className="transition-all duration-700"
          />
        </svg>
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-raleway font-semibold text-main-dark",
            size > 110 ? "text-2xl" : "text-sm",
          )}
        >
          {Math.round(value * 100)}%
        </span>
      </div>
      {label && <span className="max-w-28 truncate text-xs text-main-dark/70">{label}</span>}
    </div>
  );
}

function StreakPill({ value, label }: { value: number; label: string }) {
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-main-dark/80">
      <Flame
        className="size-3.5"
        style={{ color: "var(--main-palette-strawberry-2)" }}
        fill="var(--main-palette-strawberry-3)"
      />
      {value}
      <span className="text-main-dark/50">{label}</span>
    </span>
  );
}

function Analytics() {
  const { habits } = useHabits();
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("weekly");
  const [includeSkips, setIncludeSkips] = useState(true);
  const [focusHabit, setFocusHabit] = useState<string>("all");

  const days = RANGES.find((r) => r.key === range)!.days;
  const overall = useMemo(
    () => overallSuccessRate(habits, includeSkips),
    [habits, includeSkips],
  );
  const graphHabits = useMemo(
    () => (focusHabit === "all" ? habits : habits.filter((h) => h.id === focusHabit)),
    [habits, focusHabit],
  );
  const series = useMemo(
    () => dailySeries(graphHabits, days, includeSkips),
    [graphHabits, days, includeSkips],
  );

  return (
    <PageShell
      title="Analytics"
      subtitle={
        <p className="serif-italic text-sm text-main-dark/70">
          {includeSkips ? "Skips count as completions" : "Skips count as misses"}
        </p>
      }
    >
      <section className="mt-6 shadow-solid rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="include-skips" className="text-sm text-main-dark">
            Include skips in success rates
          </Label>
          <Switch id="include-skips" checked={includeSkips} onCheckedChange={setIncludeSkips} />
        </div>
      </section>

      <section className="mt-6 shadow-solid rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg text-main-dark">Overall</h2>
        <div className="mt-4 flex flex-col items-center">
          <Ring value={overall} color="var(--main-palette-strawberry-4)" size={148} />
          <p className="mt-3 text-sm text-main-dark/70">Overall success rate</p>
          <div className="mt-2">
            <StreakPill value={bestStreak(habits)} label="best current streak" />
          </div>
        </div>
      </section>

      <section className="mt-6 shadow-solid rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg text-main-dark">By habit</h2>
        {habits.length === 0 ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <StrawberryIcon className="size-4" /> No habits to analyse yet.
          </p>
        ) : (
          <div className="mt-5 flex flex-wrap justify-center gap-6">
            {habits.map((habit) => (
              <div key={habit.id} className="flex flex-col items-center gap-1">
                <Ring
                  value={successRate(habit, includeSkips)}
                  color="var(--main-palette-strawberry-4)"
                  label={habit.name}
                />
                <StreakPill value={currentStreak(habit)} label="streak" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 shadow-solid rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg text-main-dark">Trends</h2>
          <div className="flex gap-1 rounded-lg border border-border p-1">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRange(r.key)}
                className={cn(
                  "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  range === r.key
                    ? "bg-main-dark text-main-light"
                    : "text-main-dark/70 hover:bg-accent/40",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {[{ id: "all", name: "All habits" }, ...habits].map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setFocusHabit(h.id)}
              className={cn(
                "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                focusHabit === h.id
                  ? "border-main-dark bg-main-dark text-main-light"
                  : "border-border text-main-dark/70 hover:bg-accent/40",
              )}
            >
              {h.name}
            </button>
          ))}
        </div>

        <ChartContainer
          className="mt-5 h-64 w-full"
          config={{ rate: { label: "Success rate", color: "var(--main-palette-strawberry-4)" } }}
        >
          <LineChart data={series} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              fontSize={11}
            />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={11} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--color-rate)"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </section>
    </PageShell>
  );
}
