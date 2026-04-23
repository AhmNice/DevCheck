import { Priority } from "./priority.type.js";
import { Status } from "./status.type.js";

export type SubtaskInput = {
  title: string;
  description?: string;
  status: Status;
  due_date?: Date;
  priority?: Priority;
};

export type TaskInput = {
  title: string;
  description?: string;
  due_date: Date;
  status: Status;
  project_id?: string | null;
  priority: Priority;
  subtasks?: SubtaskInput[];
};
