import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const sanitizeInput = (val: unknown): string | unknown => {
  if (typeof val !== "string") return val;

  return sanitizeHtml(val.trim(), {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "recursiveEscape",
  });
};

const SubtaskSchema = z.object({
  title: z.preprocess(sanitizeInput, z.string().min(1)),
  description: z.preprocess(sanitizeInput, z.string().optional()),
  due_date: z.preprocess(sanitizeInput, z.string().datetime()).optional(),
  status: z.enum([
    "BACKLOG",
    "PLANNED",
    "IN_PROGRESS",
    "IN_REVIEW",
    "SHIPPED",
    "BLOCKED",
    "COMPLETED",
  ]),
});

export const TaskSchema = z.object({
  body: z
    .object({
      title: z.preprocess(sanitizeInput, z.string().min(1)),
      description: z.preprocess(sanitizeInput, z.string().optional()),
      due_date: z.preprocess(sanitizeInput, z.string().datetime()),
      project_id: z.preprocess(sanitizeInput, z.string()).optional(),
      status: z.enum([
        "BACKLOG",
        "PLANNED",
        "IN_PROGRESS",
        "IN_REVIEW",
        "SHIPPED",
        "BLOCKED",
      ]),
      priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
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
    ),
});
export const BaseTaskSchema = z
  .object({
    title: z.preprocess(sanitizeInput, z.string().min(1)),
    description: z.preprocess(sanitizeInput, z.string().optional()),
    due_date: z.preprocess(sanitizeInput, z.string().datetime()),
    project_id: z.preprocess(sanitizeInput, z.string()).optional(),
    status: z.enum([
      "BACKLOG",
      "PLANNED",
      "IN_PROGRESS",
      "IN_REVIEW",
      "SHIPPED",
      "BLOCKED",
      "COMPLETED",
    ]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
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

export const TasksFileSchema = z.array(BaseTaskSchema);
