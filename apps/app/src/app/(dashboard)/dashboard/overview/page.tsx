import { Suspense } from "react";
import { OverviewSkeleton } from "@/features/dashboard/components/overview-skeleton";
import { OverviewPage } from "@/features/dashboard/pages/overview-page";

export default function OverviewPageServer() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewPage />
    </Suspense>
  );
}
