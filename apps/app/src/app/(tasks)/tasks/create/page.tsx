import { Suspense } from "react";
import { CreateTaskSkeleton } from "@/features/tasks/components/create-task-skeleton";
import { CreateTaskPage } from "@/features/tasks/pages/create-task-page";

export default function CreateTaskPageServer() {
  return (
    <Suspense fallback={<CreateTaskSkeleton />}>
      <CreateTaskPage />
    </Suspense>
  );
}
