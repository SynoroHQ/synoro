import { Suspense } from "react";
import { GenerateApiKeySkeleton } from "@/features/auth/components/generate-api-key-skeleton";
import { GenerateApiKeyPage } from "@/features/auth/pages/generate-api-key-page";

export default function GenerateApiKeyPageServer() {
  return (
    <Suspense fallback={<GenerateApiKeySkeleton />}>
      <GenerateApiKeyPage />
    </Suspense>
  );
}
