import { cn } from "@/lib/utils";

/**
 * main-icon-strawberry-2 — the project's canonical icon.
 * A simplified pixel-art strawberry (no brown spots).
 * Use this everywhere an icon is required in the design.
 */
const PIXELS = [
  "...G..G.....",
  "..GGGGGG....",
  ".GGGGGGGG...",
  "..RRRRRRRR..",
  ".RRRSRRSRRR.",
  ".RRRRRRRRRR.",
  ".RRSRRRRSRR.",
  "..RRRRRRRR..",
  "..RRSRRSRR..",
  "...RRRRRR...",
  "....RRRR....",
  ".....RR.....",
];

const FILL: Record<string, string> = {
  G: "var(--main-palette-strawberry-4)",
  R: "var(--main-palette-strawberry-2)",
  S: "var(--main-light)",
};

export function StrawberryIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 12 12"
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
      className={cn("size-5 shrink-0 select-none", className)}
    >
      {PIXELS.map((row, y) =>
        row.split("").map((c, x) =>
          c === "." ? null : (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={FILL[c]} />
          ),
        ),
      )}
    </svg>
  );
}

export default StrawberryIcon;
