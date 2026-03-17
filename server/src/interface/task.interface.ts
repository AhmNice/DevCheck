export interface TaskInterface {
  _id: string;
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  source?: string;
  source_id?: string;
  due_date: Date;
  status: "pending" | "in_progress" | "completed";
  priority: "normal" | "medium" | "high";
  created_at: Date;
  updated_at: Date;
}

export interface SubtaskInterface {
  _id: string;
  task_id: string;
  title?: string;
  description?: string;
  due_date: Date;
  status: "pending" | "in_progress" | "completed";
  created_at: Date;
  updated_at: Date;
}
