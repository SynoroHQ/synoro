import { AppSidebar } from "@/components/nav/app-sidebar";

import { SidebarProvider } from "@synoro/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full max-w-none overflow-hidden bg-gray-50">
        <div className="flex-shrink-0">
          <AppSidebar />
        </div>
        <main className="w-full min-w-0 flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
