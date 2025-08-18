import { AppSidebar } from "@/components/nav/app-sidebar";

import { SidebarInset, SidebarProvider } from "@synoro/ui";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
