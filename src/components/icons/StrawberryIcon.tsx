import { cn } from "@/lib/utils";
import iconUrl from "@/assets/phase7/strawberry-icon-alt.png";

/**
 * strawberry-icon-alt — the project's canonical icon (Phase 7).
 * Hand-drawn strawberry on a transparent background, alt palette colors.
 */
export function StrawberryIcon({ className }: { className?: string }) {
  return (
    <img
      src={iconUrl}
      alt=""
      aria-hidden="true"
      className={cn("size-5 shrink-0 select-none object-contain", className)}
    />
  );
}

export default StrawberryIcon;
