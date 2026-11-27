import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Mail, BookOpenText, MessagesSquare, Sparkles } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

export const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Research Assistant", url: "/research", icon: BookOpenText },
  { title: "AI Chatbot", url: "/chat", icon: MessagesSquare },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { state, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2.5 px-1 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-hero text-primary-foreground shadow-lift">
            <Sparkles className="size-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <p className="truncate font-display text-sm font-bold">Workplace AI</p>
              <p className="truncate text-xs text-muted-foreground">Productivity Assistant</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={path === item.url} tooltip={item.title} className="h-10 font-medium">
                    <Link to={item.url} onClick={() => setOpenMobile(false)}>
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
      {!collapsed && (
        <SidebarFooter>
          <div className="rounded-xl bg-accent-soft p-3 text-xs text-accent-foreground">
            AI outputs can contain errors. Review before professional use.
          </div>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
