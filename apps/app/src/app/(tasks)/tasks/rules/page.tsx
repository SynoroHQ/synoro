import { Suspense } from "react";
import { TaskRulesSkeleton } from "@/features/tasks/components/task-rules-skeleton";
import { TaskRulesPage } from "@/features/tasks/pages/task-rules-page";

export default function TaskRulesPageServer() {
  return (
    <Suspense fallback={<TaskRulesSkeleton />}>
      <TaskRulesPage />
    </Suspense>
  );
}
