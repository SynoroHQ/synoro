import { Suspense } from "react";
import { ReceiptsAnalysisSkeleton } from "@/features/analytics/components/receipts-analysis-skeleton";
import { ReceiptsAnalysisPage } from "@/features/analytics/pages/receipts-analysis-page";

export default function ReceiptsAnalysisPageServer() {
  return (
    <Suspense fallback={<ReceiptsAnalysisSkeleton />}>
      <ReceiptsAnalysisPage />
    </Suspense>
  );
}
