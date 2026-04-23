import { z } from "zod";
import { BaseTaskSchema } from "./task_schema.js";

/**
 * Base Project Schema
 * Validates the project structure and ensures a "cascading" date integrity:
 * Subtask Date <= Task Date <= Project Deadline
 */
export const BaseProjectSchema = z
  .object({
    user_id: z.string().uuid().optional(),
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional(),
    deadline: z.string().datetime().optional(),
    tasks: z.array(BaseTaskSchema).optional().default([]),
  })
  .refine(
    (data) => {
      // If no deadline is set, there's nothing to restrict task dates against
      if (!data.deadline || !data.tasks || data.tasks.length === 0) return true;

      const projectDeadline = new Date(data.deadline);

      return data.tasks.every((task) => {
        const taskDue = new Date(task.due_date);

        // 1. Check if the Task itself is past the project deadline
        if (taskDue > projectDeadline) return false;

        // 2. Check if any Subtasks are past the project deadline
        // (Note: BaseTaskSchema already handles Subtask <= Task)
        return task.subtasks.every((sub) => {
          if (!sub.due_date) return true;
          return new Date(sub.due_date) <= projectDeadline;
        });
      });
    },
    {
      message: "Task or subtask due date cannot exceed project deadline",
      path: ["deadline"], // Attaches the error to the deadline field
    },
  );

/**
 * Project Request Schema
 */
export const ProjectSchema = z.object({
  body: BaseProjectSchema,
});
