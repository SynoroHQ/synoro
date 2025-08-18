"use client";

import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isPending } = useAuth();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Доступ запрещен</h1>
          <p className="text-muted-foreground mt-2">
            Для доступа к этой странице необходимо войти в систему
          </p>
          <a
            href="/auth/login"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4 inline-block rounded-md px-4 py-2"
          >
            Войти
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
