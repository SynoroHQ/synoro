import { Suspense } from "react";
import { RevokeApiKeySkeleton } from "@/features/auth/components/revoke-api-key-skeleton";
import { RevokeApiKeyPage } from "@/features/auth/pages/revoke-api-key-page";

export default function RevokeApiKeyPageServer() {
  return (
    <Suspense fallback={<RevokeApiKeySkeleton />}>
      <RevokeApiKeyPage />
    </Suspense>
  );
}
