import { Suspense } from "react";
import { TeamsSkeleton } from "@/features/auth/components/teams-skeleton";
import { TeamsPage } from "@/features/auth/pages/teams-page";

export default function TeamsPageServer() {
  return (
    <Suspense fallback={<TeamsSkeleton />}>
      <TeamsPage />
    </Suspense>
  );
}
