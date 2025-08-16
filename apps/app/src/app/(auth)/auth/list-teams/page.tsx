import { Suspense } from "react";
import { ListTeamsPage } from "@/features/auth/pages/list-teams-page";
import { ListTeamsSkeleton } from "@/features/auth/components/list-teams-skeleton";

export default function ListTeamsPageServer() {
  return (
    <Suspense fallback={<ListTeamsSkeleton />}>
      <ListTeamsPage />
    </Suspense>
  );
}
