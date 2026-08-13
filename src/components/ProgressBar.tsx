import { cn } from "@/lib/utils";

export function ProgressBar({
  value,
  className,
  showLabel = false,
  labelClassName,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
  labelClassName?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className={cn("progress-track h-2 flex-1", className)}>
        <div
          className="progress-fill h-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span
          className={cn("font-raleway text-sm font-semibold text-main-dark", labelClassName)}
        >
          {pct}%
        </span>
      )}
    </div>
  );
}
