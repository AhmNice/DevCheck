import { z } from "zod";

const SubtaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  due_date: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

const TaskSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  due_date: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["normal", "medium", "high"]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  subtasks: z.array(SubtaskSchema),
});

export const TasksFileSchema = z.array(TaskSchema);
