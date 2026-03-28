import type { DashboardSummary, Task } from "../../interface/task";
import type { TaskState } from "../taskStore";

export const createTaskHelpers = (
  set: (state: Partial<TaskState>) => void,
) => ({
  start: () => {
    set({
      loading: true,
      taskError: null,
      taskSuccess: undefined,
    });
  },
  success: ({
    dashboard = false,
    dashboardSummary,
    tasks,
    task,
    create = false,
  }: {
    create?: boolean;
    dashboard?: boolean;
    dashboardSummary?: DashboardSummary;
    tasks?: Task[];
    task?: Task;
  }) => {
    set({
      loading: false,
      taskError: null,
      taskSuccess: true,
      tasks: create && task ? [...(tasks ?? []), task] : tasks,
      dashboardSummary: dashboard ? dashboardSummary : undefined, // replace with actual summary data
    });
  },
  error: (message: string) => {
    set({
      loading: false,
      taskError: message,
      taskSuccess: undefined,
    });
  },
  stopLoading: () => {
    set({
      loading: false,
    });
  },
  reset: () => {
    set({
      loading: false,
      taskError: null,
      taskSuccess: undefined,
      dashboardSummary: null,
    });
  },
});
