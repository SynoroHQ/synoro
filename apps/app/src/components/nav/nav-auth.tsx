"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@synoro/ui/components/button";
import { cn } from "@/lib/utils";
import { Key, Settings, Shield, Users } from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/dashboard/auth/overview",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/dashboard/auth/users",
    icon: Users,
  },
  {
    title: "Roles",
    href: "/dashboard/auth/roles",
    icon: Shield,
  },
  {
    title: "API Keys",
    href: "/dashboard/auth/api-keys",
    icon: Key,
  },
];

export function NavAuth() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-2">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant={pathname === item.href ? "default" : "ghost"}
            size="sm"
            className="gap-2"
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Button>
        </Link>
      ))}
    </nav>
  );
}
