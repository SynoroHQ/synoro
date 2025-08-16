import { AppSidebar } from "@/components/nav/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <main className="bg-background flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
