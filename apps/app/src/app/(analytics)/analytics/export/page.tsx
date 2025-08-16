import { Suspense } from "react";
import { ExportSkeleton } from "@/features/analytics/components/export-skeleton";
import { ExportPage } from "@/features/analytics/pages/export-page";

export default function ExportPageServer() {
  return (
    <Suspense fallback={<ExportSkeleton />}>
      <ExportPage />
    </Suspense>
  );
}
