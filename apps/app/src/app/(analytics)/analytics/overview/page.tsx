import { Suspense } from "react";
import { AnalyticsOverviewSkeleton } from "@/features/analytics/components/analytics-overview-skeleton";
import { AnalyticsOverviewPage } from "@/features/analytics/pages/analytics-overview-page";

export default function AnalyticsOverviewPageServer() {
  return (
    <Suspense fallback={<AnalyticsOverviewSkeleton />}>
      <AnalyticsOverviewPage />
    </Suspense>
  );
}
