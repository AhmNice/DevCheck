import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const sanitizeString = (val: unknown) =>
  typeof val === "string" ? sanitizeHtml(val.trim()) : val;

const SubtaskSchema = z.object({
  title: z.preprocess(sanitizeString, z.string().min(1)),
  description: z.preprocess(sanitizeString, z.string().optional()),
  due_date: z.string().datetime().optional(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export const TaskSchema = z
  .object({
    title: z.preprocess(sanitizeString, z.string().min(1)),
    description: z.preprocess(sanitizeString, z.string().optional()),
    due_date: z.string().datetime(),
    project_id: z.string().optional(),
    status: z.enum(["pending", "in_progress", "completed"]),
    priority: z.enum(["normal", "medium", "high"]),
    subtasks: z.array(SubtaskSchema).optional().default([]),
  })
  .refine(
    (data) => {
      if (data.subtasks.length === 0) return true;
      const taskDue = new Date(data.due_date);
      return data.subtasks.every((sub) => {
        if (!sub.due_date) return true;
        const subDue = new Date(sub.due_date);
        return subDue <= taskDue;
      });
    },
    { message: "Subtask due date cannot exceed task due date" },
  );

export const TasksFileSchema = z.array(TaskSchema);
