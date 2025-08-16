import { Suspense } from "react";
import { ListSessionsSkeleton } from "@/features/auth/components/list-sessions-skeleton";
import { ListSessionsPage } from "@/features/auth/pages/list-sessions-page";

export default function ListSessionsPageServer() {
  return (
    <Suspense fallback={<ListSessionsSkeleton />}>
      <ListSessionsPage />
    </Suspense>
  );
}
