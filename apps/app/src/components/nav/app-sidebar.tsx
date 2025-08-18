"use client";

import * as React from "react";
import { UserMenu } from "@/components/auth/user-menu";
import { Kbd } from "@/components/common/kbd";
import { NavOverview } from "@/components/nav/nav-overview";
import { OrganizationSwitcher } from "@/components/nav/organization-switcher";
import { CheckSquare, Cog, LayoutGrid, Shield, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  useSidebar,
} from "@synoro/ui";

import { NavChecklist } from "./nav-checklist";
import { NavHelp } from "./nav-help";

const SIDEBAR_KEYBOARD_SHORTCUT = "[";

// This is sample data.
const data = {
  user: {
    name: "mxkaske",
    email: "max@synoro.dev",
    avatar: "/avatars/shadcn.jpg",
  },
  orgs: [
    {
      name: "Synoro",
      slug: "easy-peasy",
      plan: "Hobby",
    },
    {
      name: "Acme Corp.",
      slug: "acme-corp",
      plan: "Starter",
    },
  ],
  monitors: [
    {
      name: "Synoro Marketing",
      url: "/dashboard/monitors/overview",
      tags: ["Production"],
    },
    {
      name: "Synoro API",
      url: "/dashboard/monitors/overview",
      tags: ["Production"],
    },
    {
      name: "Synoro Dashboard",
      url: "/dashboard/monitors/overview",
      tags: ["Production"],
    },
    {
      name: "Lightweight OS",
      url: "/dashboard/monitors/overview",
      tags: ["Development"],
    },
    {
      name: "Astro Status Page",
      url: "/dashboard/monitors/overview",
      tags: ["Development"],
    },
    {
      name: "Vercel Edge Ping",
      url: "/dashboard/monitors/overview",
      tags: ["Staging"],
    },
  ],
  statusPages: [
    {
      name: "Synoro Status",
      url: "/dashboard/status-pages/status-reports",
    },
  ],
  overview: [
    {
      name: "Overview",
      url: "/",
      icon: LayoutGrid,
    },
    {
      name: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
    {
      name: "Profile",
      url: "/profile",
      icon: User,
    },
    // Keep only essential entries for admin
    {
      name: "Settings",
      url: "/settings",
      icon: Cog,
    },
    {
      name: "Analytics",
      url: "/analytics/overview",
      icon: Shield,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex h-14 justify-center border-b py-1">
        <OrganizationSwitcher orgs={data.orgs} />
      </SidebarHeader>
      <SidebarContent>
        <NavOverview items={data.overview} />
        {/* Minimal admin nav */}
        <div className="mt-auto px-2">
          <NavChecklist />
        </div>
        <NavHelp />
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div className="flex items-center justify-center p-2">
          <UserMenu />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppSidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <SidebarTrigger />
        </TooltipTrigger>
        <TooltipContent side="right">
          <p className="mr-px inline-flex items-center gap-1">
            Toggle Sidebar{" "}
            <Kbd className="bg-primary text-background border-muted-foreground">
              ⌘+{SIDEBAR_KEYBOARD_SHORTCUT}
            </Kbd>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
