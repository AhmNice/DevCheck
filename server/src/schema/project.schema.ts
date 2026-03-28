import { z } from "zod";
import { sanitizeString, TasksFileSchema } from "./task_schema.js";

export const ProjectSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    name: z.preprocess(sanitizeString, z.string().min(1)),
    description: z.preprocess(sanitizeString, z.string().optional()),
    deadline: z.string().datetime().optional(),
    tasks: TasksFileSchema.optional().default([]),
  })
  .refine(
    (data) => {
      if (!data.deadline || !data.tasks) return true;

      // Ensure task/subtask due dates <= project deadline
      return data.tasks.every((task) => {
        const taskDue = new Date(task.due_date);
        if (taskDue > new Date(data.deadline!)) return false;

        return task.subtasks.every((sub) => {
          if (!sub.due_date) return true;
          const subDue = new Date(sub.due_date);
          return subDue <= new Date(data.deadline!);
        });
      });
    },
    {
      message: "Task or subtask due date cannot exceed project deadline",
    },
  );
