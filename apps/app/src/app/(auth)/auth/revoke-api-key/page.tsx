import { Suspense } from "react";
import { RevokeApiKeyPage } from "@/features/auth/pages/revoke-api-key-page";
import { RevokeApiKeySkeleton } from "@/features/auth/components/revoke-api-key-skeleton";

export default function RevokeApiKeyPageServer() {
  return (
    <Suspense fallback={<RevokeApiKeySkeleton />}>
      <RevokeApiKeyPage />
    </Suspense>
  );
}
