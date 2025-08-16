import { Suspense } from "react";
import { TasksCalendarSkeleton } from "@/features/tasks/components/tasks-calendar-skeleton";
import { TasksCalendarPage } from "@/features/tasks/pages/tasks-calendar-page";

export default function TasksCalendarPageServer() {
  return (
    <Suspense fallback={<TasksCalendarSkeleton />}>
      <TasksCalendarPage />
    </Suspense>
  );
}
