import { Suspense } from "react";
import { OverviewPage } from "@/features/dashboard/pages/overview-page";
import { OverviewSkeleton } from "@/features/dashboard/components/overview-skeleton";

export default function OverviewPageServer() {
  return (
    <Suspense fallback={<OverviewSkeleton />}>
      <OverviewPage />
    </Suspense>
  );
}
