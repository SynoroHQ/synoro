"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { Session } from "@synoro/auth";
import { useSession } from "@synoro/auth/client";

interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isLoading } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value: AuthContextType = {
    session: session || null,
    isLoading,
    isAuthenticated: !!session,
  };

  if (!mounted) {
    return (
      <AuthContext.Provider
        value={{ session: null, isLoading: true, isAuthenticated: false }}
      >
        {children}
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
