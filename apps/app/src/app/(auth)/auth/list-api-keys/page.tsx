import { Suspense } from "react";
import { ListApiKeysSkeleton } from "@/features/auth/components/list-api-keys-skeleton";
import { ListApiKeysPage } from "@/features/auth/pages/list-api-keys-page";

export default function ListApiKeysPageServer() {
  return (
    <Suspense fallback={<ListApiKeysSkeleton />}>
      <ListApiKeysPage />
    </Suspense>
  );
}
