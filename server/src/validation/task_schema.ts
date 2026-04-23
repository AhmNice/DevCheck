import { z } from "zod";

// 1. The Raw Shape (No refinements yet)
const TaskShape = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  due_date: z.iso.datetime(),
  project_id: z.string().optional(),
  status: z.enum([
    "BACKLOG",
    "PLANNED",
    "IN_PROGRESS",
    "IN_REVIEW",
    "SHIPPED",
    "BLOCKED",
  ]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  subtasks: z
    .array(
      z.object({
        title: z.string().min(1),
        due_date: z.string().datetime().optional(),
        status: z.enum([
          "BACKLOG",
          "PLANNED",
          "IN_PROGRESS",
          "IN_REVIEW",
          "SHIPPED",
          "BLOCKED",
        ]),
        description: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

// 2. The Reusable Refinement Logic
const dateRefinement = {
  validator: (data: any) => {
    if (!data.subtasks || !data.due_date) return true;
    const taskDue = new Date(data.due_date);
    return data.subtasks.every((sub: any) => {
      if (!sub.due_date) return true;
      return new Date(sub.due_date) <= taskDue;
    });
  },
  params: {
    message: "Subtask due date cannot exceed task due date",
    path: ["subtasks"],
  },
};

/**
 * BaseTaskSchema
 * Used for internal logic and as a building block for Projects.
 */
export const BaseTaskSchema = TaskShape.refine(
  dateRefinement.validator,
  dateRefinement.params,
);

/**
 * TaskSchema (For CREATE)
 * Wraps the base logic in a 'body' object for Express middleware.
 */
export const TaskSchema = z.object({
  body: BaseTaskSchema,
});

/**
 * TasksFileSchema
 * Restored: Used for bulk imports/JSON file uploads.
 */
export const TasksFileSchema = z.array(BaseTaskSchema);

/**
 * UpdateTaskSchema (For PATCH)
 * Partial first to allow optional fields, then re-applies the date logic.
 */
export const UpdateTaskSchema = z.object({
  body: TaskShape.partial().refine(
    dateRefinement.validator,
    dateRefinement.params,
  ),
});
export const updateStatusSchema = z.object({
  body: z.object({
    task_id: z.string().uuid("Invalid Task ID"),
    newStatus: z.enum([
      "BACKLOG",
      "PLANNED",
      "IN_PROGRESS",
      "IN_REVIEW",
      "SHIPPED",
      "BLOCKED",
      "COMPLETED",
    ]),
    blockedReason: z.string().optional(),
  }),
  params: z.object({
    task_id: z.string().uuid("Invalid Task ID in URL"),
  }),
});
