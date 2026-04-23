import { Request, Response } from "express";
import { asyncHandler } from "../utils/requestHandler.js";
import { TaskService } from "../service/Task.service.js";
import { APIError } from "../utils/errorHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { FileRequest } from "../utils/json_task_handler.js";
import { TasksFileSchema } from "../validation/task_schema.js";

/**
 * Helper to ensure user_id exists from middleware
 */
const getAuthUser = (req: Request) => {
  const userId = req.user?.user_id;
  if (!userId) {
    throw new APIError({
      message: "Unauthorized: User session not found",
      statusCode: 401,
      code: "UNAUTHORIZED",
    });
  }
  return userId;
};

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUser(req);

  // Spread body but force the authenticated userId
  const task = await TaskService.create({ ...req.body, user_id: userId });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export const getTaskWithSubtasks = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthUser(req);
    const { task_id } = req.params;

    const task = await TaskService.taskDetails({
      id: `${task_id}`,
      user_id: userId,
    });

    if (!task) {
      throw new APIError({ message: "Task not found", statusCode: 404 });
    }

    return res
      .status(200)
      .json(new ApiResponse(200, task, "Task details retrieved"));
  },
);

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUser(req);
  const { task_id } = req.params;

  const updatedTask = await TaskService.update({
    id: `${task_id}`,
    userId: userId,
    data: req.body, // The service handles the destructuring/guards
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTask, "Task updated successfully"));
});

export const changeStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthUser(req);
    const { task_id, newStatus, blockedReason } = req.body;

    if (!task_id || !newStatus) {
      throw new APIError({
        message: "Task ID and New Status are required",
        statusCode: 400,
      });
    }

    const updatedTask = await TaskService.transitionStatus({
      taskId: task_id,
      userId: userId,
      newStatus,
      blockedReason: newStatus === "BLOCKED" ? blockedReason : null,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedTask, "Status transitioned successfully"),
      );
  },
);

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = getAuthUser(req);
  const { task_id } = req.params;

  await TaskService.deleteById({ id: `${task_id}`, user_id: userId });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Task deleted successfully"));
});

export const getTasksByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthUser(req); // Usually, users should only see their own tasks
    const { limit, page } = req.query; // Use query params for pagination

    const tasks = await TaskService.getTasksByUserId({
      user_id: userId,
      limit: limit as string,
      page: page as string,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, tasks, "User tasks retrieved"));
  },
);

export const getTaskSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getAuthUser(req);
    const summary = await TaskService.summaryByUser({ user_id: userId });

    return res
      .status(200)
      .json(new ApiResponse(200, summary, "Summary retrieved"));
  },
);
export const uploadJsonTaskFile = asyncHandler(
  async (req: FileRequest, res: Response) => {
    const userId = getAuthUser(req);
    const file = req.file;

    if (!file) {
      throw new APIError({ message: "No file uploaded", statusCode: 400 });
    }

    const content = file.buffer.toString("utf-8");
    const parsedContent = JSON.parse(content);
    const validatedTasks = TasksFileSchema.parse(parsedContent);
    const normalizedTasks = validatedTasks.map((task) => ({
      ...task,
      due_date: new Date(task.due_date),
      subtasks: task.subtasks.map((subtask) => ({
        ...subtask,
        due_date: subtask.due_date ? new Date(subtask.due_date) : undefined,
      })),
    }));

    const results = await TaskService.bulkCreateFromJson({
      user_id: userId,
      payload: normalizedTasks,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, results, "Tasks uploaded successfully"));
  },
);
