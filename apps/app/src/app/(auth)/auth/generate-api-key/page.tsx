import { Suspense } from "react";
import { GenerateApiKeyPage } from "@/features/auth/pages/generate-api-key-page";
import { GenerateApiKeySkeleton } from "@/features/auth/components/generate-api-key-skeleton";

export default function GenerateApiKeyPageServer() {
  return (
    <Suspense fallback={<GenerateApiKeySkeleton />}>
      <GenerateApiKeyPage />
    </Suspense>
  );
}
