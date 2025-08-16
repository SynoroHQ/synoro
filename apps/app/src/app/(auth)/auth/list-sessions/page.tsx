import { Suspense } from "react";
import { ListSessionsPage } from "@/features/auth/pages/list-sessions-page";
import { ListSessionsSkeleton } from "@/features/auth/components/list-sessions-skeleton";

export default function ListSessionsPageServer() {
  return (
    <Suspense fallback={<ListSessionsSkeleton />}>
      <ListSessionsPage />
    </Suspense>
  );
}
