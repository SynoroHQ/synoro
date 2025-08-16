import { Suspense } from "react";
import { GetTeamsSkeleton } from "@/features/auth/components/get-teams-skeleton";
import { GetTeamsPage } from "@/features/auth/pages/get-teams-page";

export default function GetTeamsPageServer() {
  return (
    <Suspense fallback={<GetTeamsSkeleton />}>
      <GetTeamsPage />
    </Suspense>
  );
}
