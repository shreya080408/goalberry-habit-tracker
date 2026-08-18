import { Link, useRouterState } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  TodaysHabitsIcon,
  AllHabitsIcon,
  CalendarPageIcon,
  AnalyticsIcon,
  SettingsPageIcon,
} from "@/components/icons/PhaseIcons";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";

const items = [
  { title: "Today's Habits", url: "/", icon: TodaysHabitsIcon },
  { title: "All Habits", url: "/habits", icon: AllHabitsIcon },
  { title: "Calendar", url: "/calendar", icon: CalendarPageIcon },
  { title: "Analytics", url: "/analytics", icon: AnalyticsIcon },
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Settings", url: "/settings", icon: SettingsPageIcon },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });
  const { open, setOpen, isMobile, setOpenMobile } = useSidebar();
  const rootRef = useRef<HTMLDivElement>(null);

  const closeSidebar = () => {
    if (isMobile) setOpenMobile(false);
    else setOpen(false);
  };

  useEffect(() => {
    if (isMobile || !open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isMobile, open, setOpen]);

  return (
    <Sidebar ref={rootRef} collapsible="icon">
      <SidebarHeader className="flex-row items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 items-center gap-2 group-data-[collapsible=icon]:hidden">
          <StrawberryIcon className="size-5 shrink-0" />
          <span className="font-display truncate text-main-light">Goalberry</span>
        </div>
        <SidebarTrigger className="mt-1 shrink-0 text-main-light hover:text-main-light" />
      </SidebarHeader>
      <SidebarContent className="group-data-[collapsible=icon]:hidden">
        <SidebarGroup className="p-4">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2 rounded-lg" onClick={closeSidebar}>
                      <item.icon className="size-4" />
                      <span className="font-bold uppercase">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
