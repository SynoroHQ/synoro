import { Suspense } from "react";
import { ApiKeysSkeleton } from "@/features/auth/components/api-keys-skeleton";
import { ApiKeysPage } from "@/features/auth/pages/api-keys-page";

export default function ApiKeysPageServer() {
  return (
    <Suspense fallback={<ApiKeysSkeleton />}>
      <ApiKeysPage />
    </Suspense>
  );
}
