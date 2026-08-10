import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, CalendarDays, Gift, LineChart } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { StrawberryIcon } from "@/components/icons/StrawberryIcon";

const items = [
  { title: "Today's Habits", url: "/", icon: CalendarCheck },
  { title: "All Habits", url: "/habits", icon: ListChecks },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Rewards", url: "/rewards", icon: Gift },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="gap-2">
            <StrawberryIcon className="size-4" />
            <span className="font-display text-main-dark">Goalberry</span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <Link to={item.url} className="flex items-center gap-2 rounded-lg">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
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
