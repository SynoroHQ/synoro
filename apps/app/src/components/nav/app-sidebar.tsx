"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  Bot,
  Calendar,
  CheckSquare,
  FileText,
  Home,
  Receipt,
  Settings,
} from "lucide-react";

import { Button } from "@synoro/ui";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@synoro/ui/components/sidebar";

export function AppSidebar({ ...props }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <Sidebar {...props} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-md">
                  <span className="text-lg font-bold">S</span>
                </div>
                <span className="text-lg font-bold">Synoro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarInset>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Основное</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
                    <Link href="/dashboard">
                      <Home className="h-4 w-4" />
                      <span>Главная</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/events")}>
                    <Link href="/events">
                      <FileText className="h-4 w-4" />
                      <span>События</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/tasks")}>
                    <Link href="/tasks">
                      <CheckSquare className="h-4 w-4" />
                      <span>Задачи</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/receipts")}>
                    <Link href="/receipts">
                      <Receipt className="h-4 w-4" />
                      <span>Чеки</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/analytics")}>
                    <Link href="/analytics">
                      <BarChart3 className="h-4 w-4" />
                      <span>Аналитика</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/calendar")}>
                    <Link href="/calendar">
                      <Calendar className="h-4 w-4" />
                      <span>Календарь</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Интеграции</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/telegram")}>
                    <Link href="/telegram">
                      <Bot className="h-4 w-4" />
                      <span>Telegram Bot</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Настройки</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActive("/profile")}>
                    <Link href="/profile">
                      <Settings className="h-4 w-4" />
                      <span>Профиль</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarInset>

      <SidebarFooter>
        <div className="flex items-center justify-between p-4">
          <UserMenu />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export function AppSidebarTrigger() {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-accent hover:text-accent-foreground gap-2 px-2 text-base md:hidden"
    >
      <SidebarTrigger className="h-5 w-5" />
      <span>Меню</span>
    </Button>
  );
}
