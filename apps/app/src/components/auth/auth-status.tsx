"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2, LogOut, User } from "lucide-react";

import { Button } from "@synoro/ui/components/button";

export function AuthStatus() {
  const { user, isPending, isAuthenticated, logout, error } = useAuth();

  if (isPending) {
    return (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-muted-foreground text-sm">Загрузка...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-destructive text-sm">Ошибка загрузки данных</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Button asChild variant="outline" size="sm">
          <a href="/auth/login">Войти</a>
        </Button>
        <Button asChild size="sm">
          <a href="/auth/register">Регистрация</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <User className="h-4 w-4" />
        <span className="text-sm">{user?.name || user?.email}</span>
      </div>
      <Button variant="ghost" size="sm" onClick={logout}>
        <LogOut className="mr-2 h-4 w-4" />
        Выйти
      </Button>
    </div>
  );
}
