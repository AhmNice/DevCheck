import { Priority } from "../types/priority.type.js";
import { Status } from "../types/status.type.js";

export interface TaskInterface {
  _id: string;
  user_id: string;
  project_id?: string | null;
  title: string;
  description?: string;
  blocked_reason?: string;
  source?: string;
  source_id?: string;
  due_date: Date;
  status: Status;
  priority: Priority;
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
  status: Status;
  created_at: Date;
  updated_at: Date;
}

export interface taskUpdateInterface {
  title?: string;
  description?: string;
  due_date?: Date;
  status?: Status;
  priority?: Priority;
  project_id?: string | null;
  subtasks?: Partial<SubtaskInterface[]>;
  source?: string;
  source_id?: string;
  blocked_reason?: string;
}
