import { Link, useRouterState } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import {
  TodaysHabitsIcon,
  AllHabitsIcon,
  CalendarPageIcon,
  AnalyticsIcon,
  SettingsPageIcon,
} from "@/components/icons/PhaseIcons";
import { cn } from "@/lib/utils";

export const NAV_ITEMS = [
  { title: "Today's Habits", url: "/", icon: TodaysHabitsIcon },
  { title: "All Habits", url: "/habits", icon: AllHabitsIcon },
  { title: "Calendar", url: "/calendar", icon: CalendarPageIcon },
  { title: "Analytics", url: "/analytics", icon: AnalyticsIcon },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Settings", url: "/settings", icon: SettingsPageIcon },
] as const;

/** Icon navigation for tablet and mobile only. */
export function BottomNav() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const activeIndex = NAV_ITEMS.findIndex((item) => item.url === currentPath);
  const count = NAV_ITEMS.length;

  return (
    <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-40 bg-main-dark md:hidden">
      <ul className="relative mx-auto flex max-w-2xl">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 bg-main-light transition-transform duration-300 ease-out"
            style={{
              width: `${100 / count}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        )}
        {NAV_ITEMS.map((item) => {
          const active = currentPath === item.url;
          return (
            <li key={item.url} className="relative flex-1">
              <Link
                to={item.url}
                aria-label={item.title}
                className={cn(
                  "bouncy-press relative flex h-14 w-full items-center justify-center",
                  active ? "text-main-dark" : "text-main-light",
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
