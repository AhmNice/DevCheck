export type TaskStatus =
  | "BACKLOG"
  | "PLANNED"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "SHIPPED"
  | "BLOCKED";

export interface Subtask {
  _id: string; // UUID
  task_id: string; // UUID referencing parent task
  title: string;
  description?: string;
  due_date: string; // ISO timestamp string
  status: TaskStatus; // task status enum
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

export interface Task {
  _id: string;
  user_id: string;
  project_id: string;
  title: string;
  description?: string;
  due_date: Date | string;
  status: TaskStatus;
  completed_subtasks: number;
  total_subtasks: number;
  priority: " LOW" | "MEDIUM" | "HIGH";
  created_by: {
    email: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
  subtasks: Subtask[];
  isOverDue: boolean;
  attachments: {
    _id: string;
    filename: string;
    url: string;
    created_at: string;
    size?: number;
  }[];
  blocked_reason?: string;
}
export interface TaskSummaryItem {
  status_group: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  count: string;
}

export interface WeeklySummaryItem {
  week_start: string; // ISO date string
  status_group: "PLANNED" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED";
  count: string;
}

export interface CurrentWeekSummaryItem {
  day: string; // ISO date string
  day_name: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  task_count: string;
}

export interface DashboardSummary {
  taskSummary: TaskSummaryItem[];
  weeklySummary: WeeklySummaryItem[];
  currentWeekSummary: CurrentWeekSummaryItem[];
}
