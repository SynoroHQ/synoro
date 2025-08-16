import { Suspense } from "react";
import { DashboardOverview } from "@/features/dashboard/pages/dashboard-overview";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  );
}
