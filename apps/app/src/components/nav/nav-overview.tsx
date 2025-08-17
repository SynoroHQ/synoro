"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@synoro/ui/components/sidebar";
import { type LucideIcon } from "lucide-react";

export function NavOverview({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
}) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const allowed = new Set([
    "/dashboard/overview",
    "/dashboard/settings/general",
  ]);
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Workspace</SidebarGroupLabel>
      <SidebarMenu>
        {items
          .filter((item) => allowed.has(item.url))
          .map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                isActive={pathname.includes(item.url)}
                asChild
                tooltip={item.name}
              >
                <Link href={item.url} onClick={() => setOpenMobile(false)}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
