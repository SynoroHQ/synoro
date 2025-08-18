"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { signOut, useSession } from "@synoro/auth/client";

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  const router = useRouter();

  const logout = async () => {
    try {
      await signOut();
      toast.success("Вы успешно вышли из системы");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Ошибка при выходе из системы");
    }
  };

  const isAuthenticated = !!session;
  const user = session?.user;

  return {
    session,
    user,
    isPending,
    error,
    isAuthenticated,
    logout,
  };
}
