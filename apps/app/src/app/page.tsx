import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/components/nav/app-sidebar";

import { SidebarInset, SidebarProvider } from "@synoro/ui/components/sidebar";

export default function HomePage() {
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="flex min-h-screen bg-gray-50">
          <AppSidebar />
          <SidebarInset>
            <main className="flex-1 overflow-y-auto bg-gray-50">
              <div className="container mx-auto px-4 py-6">
                <h1 className="mb-4 text-2xl font-bold">Dashboard Overview</h1>
                <p>Dashboard overview functionality is under construction.</p>
              </div>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
