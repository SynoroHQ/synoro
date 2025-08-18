"use client";

import { useAuth } from "@/hooks/use-auth";

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
  const { user, logout, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex items-center space-x-2">
        <div className="bg-muted h-8 w-8 animate-pulse rounded-full" />
        <div className="bg-muted h-4 w-20 animate-pulse rounded" />
      </div>
    );
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm">
        <a href="/auth/login">Войти</a>
      </Button>
    );
  }

  const initials =
    user.firstName && user.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.image || undefined}
              alt={user.email || "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm leading-none font-medium">
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : "Пользователь"}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/profile">Профиль</a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/settings">Настройки</a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Выйти</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
