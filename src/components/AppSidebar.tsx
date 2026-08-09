import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, ListChecks, Gift, LineChart } from "lucide-react";
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
  { title: "Rewards", url: "/rewards", icon: Gift },
  { title: "Analytics", url: "/analytics", icon: LineChart },
] as const;

export function AppSidebar() {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
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
                    <Link to={item.url} className="flex items-center gap-2">
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
