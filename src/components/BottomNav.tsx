import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, CalendarDays, Gift, LineChart, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { title: "Today's Habits", url: "/", icon: CalendarCheck },
  { title: "All Habits", url: "/habits", icon: ListChecks },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Settings", url: "/settings", icon: Settings },
] as const;

/** Icon navigation for tablet and mobile only. */
export function BottomNav() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-2xl items-center justify-between px-2 py-1.5">
        {NAV_ITEMS.map((item) => {
          const active = currentPath === item.url;
          return (
            <li key={item.url}>
              <Link
                to={item.url}
                aria-label={item.title}
                className={cn(
                  "bouncy-press flex size-11 items-center justify-center rounded-lg",
                  active ? "bg-main-dark text-main-light" : "text-main-dark/70",
                )}
              >
                <item.icon className="size-5" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomNav;
