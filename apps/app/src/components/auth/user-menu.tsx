"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, Settings, Shield, User } from "lucide-react";

import { signOut, useSession } from "@synoro/auth/client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@synoro/ui/components/avatar";
import { Button } from "@synoro/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@synoro/ui/components/dropdown-menu";

export function UserMenu() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ redirect: false });
      window.location.href = "/auth/login";
    } catch (error) {
      console.error("Ошибка при выходе:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roleLabels: Record<string, string> = {
      super_admin: "Супер администратор",
      admin: "Администратор",
      moderator: "Модератор",
      editor: "Редактор",
      user: "Пользователь",
    };
    return roleLabels[role] || role;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user.image || ""}
              alt={session.user.name || ""}
            />
            <AvatarFallback>
              {session.user.name ? (
                getUserInitials(session.user.name)
              ) : (
                <User className="h-4 w-4" />
              )}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {session.user.name || "Пользователь"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {session.user.email}
            </p>
            <div className="mt-1 flex items-center space-x-1">
              <Shield className="text-muted-foreground h-3 w-3" />
              <span className="text-muted-foreground text-xs">
                {getRoleLabel(session.user.role || "user")}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Выход..." : "Выйти"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
