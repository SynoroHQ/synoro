import { Suspense } from "react";
import { ListTeamsSkeleton } from "@/features/auth/components/list-teams-skeleton";
import { ListTeamsPage } from "@/features/auth/pages/list-teams-page";

export default function ListTeamsPageServer() {
  return (
    <Suspense fallback={<ListTeamsSkeleton />}>
      <ListTeamsPage />
    </Suspense>
  );
}
