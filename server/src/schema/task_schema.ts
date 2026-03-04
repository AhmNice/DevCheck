import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const sanitizeString = (val: unknown) =>
  typeof val === "string" ? sanitizeHtml(val.trim()) : val;

const SubtaskSchema = z.object({
  title: z.preprocess(sanitizeString, z.string().min(1)),
  description: z.preprocess(sanitizeString, z.string().optional()),
  due_date: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

const TaskSchema = z.object({
  title: z.preprocess(sanitizeString, z.string().min(1)),
  description: z.preprocess(sanitizeString, z.string().optional()),
  due_date: z.string().datetime(),
  status: z.enum(["pending", "in_progress", "completed"]),
  priority: z.enum(["normal", "medium", "high"]),
  subtasks: z.array(SubtaskSchema).optional().default([]),
});

export const TasksFileSchema = z.array(TaskSchema);
