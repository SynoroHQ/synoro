import { Suspense } from "react";
import { TasksListSkeleton } from "@/features/tasks/components/tasks-list-skeleton";
import { TasksListPage } from "@/features/tasks/pages/tasks-list-page";

export default function TasksListPageServer() {
  return (
    <Suspense fallback={<TasksListSkeleton />}>
      <TasksListPage />
    </Suspense>
  );
}
