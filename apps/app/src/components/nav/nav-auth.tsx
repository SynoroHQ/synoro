"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Key, Settings, Shield, Users } from "lucide-react";

import { Button } from "@synoro/ui";

const navItems = [
  {
    title: "Overview",
    href: "/auth/overview",
    icon: Settings,
  },
  {
    title: "Users",
    href: "/auth/users",
    icon: Users,
  },
  {
    title: "Roles",
    href: "/auth/roles",
    icon: Shield,
  },
  {
    title: "API Keys",
    href: "/auth/api-keys",
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
