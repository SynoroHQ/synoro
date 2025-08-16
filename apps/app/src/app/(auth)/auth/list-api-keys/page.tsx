import { Suspense } from "react";
import { ListApiKeysPage } from "@/features/auth/pages/list-api-keys-page";
import { ListApiKeysSkeleton } from "@/features/auth/components/list-api-keys-skeleton";

export default function ListApiKeysPageServer() {
  return (
    <Suspense fallback={<ListApiKeysSkeleton />}>
      <ListApiKeysPage />
    </Suspense>
  );
}
