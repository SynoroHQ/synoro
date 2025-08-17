import Link from "next/link";
import { Calendar, CheckSquare, List, Settings } from "lucide-react";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "List", href: "/tasks/list", icon: List },
    { name: "Create", href: "/tasks/create", icon: CheckSquare },
    { name: "Calendar", href: "/tasks/calendar", icon: Calendar },
    { name: "Rules", href: "/tasks/rules", icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b">
        <h1 className="mb-4 text-2xl font-bold">Tasks Management</h1>
        <nav className="flex space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
