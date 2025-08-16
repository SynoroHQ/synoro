import { Suspense } from "react";
import { IntegrationsSkeleton } from "@/features/auth/components/integrations-skeleton";
import { IntegrationsPage } from "@/features/auth/pages/integrations-page";

export default function IntegrationsPageServer() {
  return (
    <Suspense fallback={<IntegrationsSkeleton />}>
      <IntegrationsPage />
    </Suspense>
  );
}
