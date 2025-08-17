"use client";

import * as React from "react";
import { Kbd } from "@/components/common/kbd";
import { NavMonitors } from "@/components/nav/nav-monitors";
import { NavOverview } from "@/components/nav/nav-overview";
import { NavUser } from "@/components/nav/nav-user";
import { OrganizationSwitcher } from "@/components/nav/organization-switcher";
import { CheckSquare, Cog, LayoutGrid, Shield } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@synoro/ui/components/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@synoro/ui/components/tooltip";

import { NavChecklist } from "./nav-checklist";
import { NavHelp } from "./nav-help";

const SIDEBAR_KEYBOARD_SHORTCUT = "[";

// This is sample data.
const data = {
  user: {
    name: "mxkaske",
    email: "max@openstatus.dev",
    avatar: "/avatars/shadcn.jpg",
  },
  orgs: [
    {
      name: "OpenStatus",
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
      name: "OpenStatus Marketing",
      url: "/dashboard/monitors/overview",
      tags: ["Production"],
    },
    {
      name: "OpenStatus API",
      url: "/dashboard/monitors/overview",
      tags: ["Production"],
    },
    {
      name: "OpenStatus Dashboard",
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
      name: "OpenStatus Status",
      url: "/dashboard/status-pages/status-reports",
    },
  ],
  overview: [
    {
      name: "Overview",
      url: "/dashboard/overview",
      icon: LayoutGrid,
    },
    {
      name: "Tasks",
      url: "/dashboard/tasks/list",
      icon: CheckSquare,
    },
    // Keep only essential entries for admin
    {
      name: "Settings",
      url: "/dashboard/settings/general",
      icon: Cog,
    },
    {
      name: "Auth",
      url: "/dashboard/auth",
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
        <NavUser user={data.user} />
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
