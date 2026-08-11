import { cn } from "@/lib/utils";
import iconAsset from "@/assets/main-icon-strawberry-3.png.asset.json";

/**
 * main-icon-strawberry-3 — the project's canonical icon.
 * Hand-drawn strawberry, used everywhere an app icon is required.
 */
export function StrawberryIcon({ className }: { className?: string }) {
  return (
    <img
      src={iconAsset.url}
      alt=""
      aria-hidden="true"
      className={cn("size-5 shrink-0 select-none object-contain", className)}
    />
  );
}

export default StrawberryIcon;
