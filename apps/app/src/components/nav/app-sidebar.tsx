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
    <Sidebar {...props} collapsible="icon" className="w-auto min-w-0">
      <SidebarHeader className="w-auto min-w-0">
        <SidebarMenu className="w-auto min-w-0">
          <SidebarMenuItem className="w-auto min-w-0">
            <SidebarMenuButton asChild className="w-auto min-w-0">
              <Link href="/dashboard" className="w-auto min-w-0">
                <div className="bg-primary text-primary-foreground flex h-8 w-8 w-auto min-w-0 items-center justify-center rounded-md">
                  <span className="w-auto min-w-0 text-lg font-bold">S</span>
                </div>
                <span className="w-auto min-w-0 text-lg font-bold">Synoro</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarInset className="w-auto min-w-0">
        <SidebarContent className="w-auto min-w-0">
          <SidebarGroup className="w-auto min-w-0">
            <SidebarGroupLabel className="w-auto min-w-0">
              Основное
            </SidebarGroupLabel>
            <SidebarGroupContent className="w-auto min-w-0">
              <SidebarMenu className="w-auto min-w-0">
                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/dashboard")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/dashboard" className="w-auto min-w-0">
                      <Home className="h-4 w-4" />
                      <span className="w-auto min-w-0">Главная</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/events")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/events" className="w-auto min-w-0">
                      <FileText className="h-4 w-4" />
                      <span className="w-auto min-w-0">События</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/tasks")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/tasks" className="w-auto min-w-0">
                      <CheckSquare className="h-4 w-4" />
                      <span className="w-auto min-w-0">Задачи</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/receipts")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/receipts" className="w-auto min-w-0">
                      <Receipt className="h-4 w-4" />
                      <span className="w-auto min-w-0">Чеки</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/analytics")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/analytics" className="w-auto min-w-0">
                      <BarChart3 className="h-4 w-4" />
                      <span className="w-auto min-w-0">Аналитика</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/calendar")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/calendar" className="w-auto min-w-0">
                      <Calendar className="h-4 w-4" />
                      <span className="w-auto min-w-0">Календарь</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="w-auto min-w-0">
            <SidebarGroupLabel className="w-auto min-w-0">
              Интеграции
            </SidebarGroupLabel>
            <SidebarGroupContent className="w-auto min-w-0">
              <SidebarMenu className="w-auto min-w-0">
                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/telegram")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/telegram" className="w-auto min-w-0">
                      <Bot className="h-4 w-4" />
                      <span className="w-auto min-w-0">Telegram Bot</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="w-auto min-w-0">
            <SidebarGroupLabel className="w-auto min-w-0">
              Настройки
            </SidebarGroupLabel>
            <SidebarGroupContent className="w-auto min-w-0">
              <SidebarMenu className="w-auto min-w-0">
                <SidebarMenuItem className="w-auto min-w-0">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive("/profile")}
                    className="w-auto min-w-0"
                  >
                    <Link href="/profile" className="w-auto min-w-0">
                      <Settings className="h-4 w-4" />
                      <span className="w-auto min-w-0">Профиль</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarInset>

      <SidebarFooter className="w-auto min-w-0">
        <div className="flex w-auto min-w-0 items-center justify-between p-4">
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
      className="hover:bg-accent hover:text-accent-foreground w-auto min-w-0 gap-2 px-2 text-base md:hidden"
    >
      <SidebarTrigger className="h-5 w-5 w-auto min-w-0" />
      <span className="w-auto min-w-0">Меню</span>
    </Button>
  );
}
