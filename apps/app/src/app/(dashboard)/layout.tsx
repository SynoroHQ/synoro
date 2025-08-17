import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/nav/app-sidebar";

import { SidebarInset, SidebarProvider } from "@synoro/ui/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-50">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-4 py-6">{children}</div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
