export interface TaskInterface {
  _id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description?: string;
  source?: string;
  source_id?: string;
  due_date: Date;
  status:
    | "BACKLOG"
    | "PLANNED"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "SHIPPED"
    | "BLOCKED"
    | "COMPLETED"
    | "SHIPPED";
  priority: "LOW" | "MEDIUM" | "HIGH";
  created_at: Date;
  updated_at: Date;
  subtasks?: SubtaskInterface[];
}

export interface SubtaskInterface {
  _id: string;
  task_id: string;
  title?: string;
  description?: string;
  due_date: Date;
  status:
    | "BACKLOG"
    | "PLANNED"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "SHIPPED"
    | "BLOCKED"
    | "COMPLETED";
  created_at: Date;
  updated_at: Date;
}

export interface taskUpdateInterface {
  title?: string;
  description?: string;
  due_date?: Date;
  status?:
    | "BACKLOG"
    | "PLANNED"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "SHIPPED"
    | "BLOCKED"
    | "COMPLETED";
  priority?: "LOW" | "MEDIUM" | "HIGH";
  project_id?: string | null;
  subtasks?: Partial<SubtaskInterface[]>;
  source?: string;
  source_id?: string;
}
