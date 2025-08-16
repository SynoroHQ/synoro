import { Suspense } from "react";
import { SearchSkeleton } from "@/features/dashboard/components/search-skeleton";
import { SearchPage } from "@/features/dashboard/pages/search-page";

export default function SearchPageServer() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchPage />
    </Suspense>
  );
}
