"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useSession } from "@synoro/auth/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        // Пользователь не авторизован - редирект на логин
        router.push("/auth/login");
        return;
      }

      if (requiredRole) {
        // Проверяем роль пользователя
        const userRole = session.user?.role;
        if (userRole !== requiredRole && userRole !== "super_admin") {
          // Пользователь не имеет необходимой роли
          router.push("/dashboard");
          return;
        }
      }

      setIsAuthorized(true);
    }
  }, [session, isLoading, requiredRole, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
