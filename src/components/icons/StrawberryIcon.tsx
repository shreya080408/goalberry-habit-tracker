import strawberry from "@/assets/strawberry.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * main-icon-strawberry — the project's canonical icon.
 * Use this everywhere an icon is required in the design.
 */
export function StrawberryIcon({ className }: { className?: string }) {
  return (
    <img
      src={strawberry.url}
      alt=""
      aria-hidden="true"
      className={cn("size-5 select-none [image-rendering:pixelated]", className)}
      draggable={false}
    />
  );
}

export default StrawberryIcon;
