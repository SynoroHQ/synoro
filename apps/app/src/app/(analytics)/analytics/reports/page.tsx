import { Suspense } from "react";
import { ReportsSkeleton } from "@/features/analytics/components/reports-skeleton";
import { ReportsPage } from "@/features/analytics/pages/reports-page";

export default function ReportsPageServer() {
  return (
    <Suspense fallback={<ReportsSkeleton />}>
      <ReportsPage />
    </Suspense>
  );
}
