import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { TaskService } from "../service/Task.service.js";

/**
 * @route   POST /tasks
 * @desc    Creates a new task (and optional subtasks)
 * @access  Authenticated
 */
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const task = await TaskService.create(req.body);

  return res.status(201).json({
    success: true,
    message: "Task created successfully",
    task,
  });
});

/**
 * @route   GET /tasks/:task_id
 * @desc    Get full task details including subtasks and user info
 */
export const getTaskWithSubtasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { task_id } = req.params;
    const user_id = req.user?.user_id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const task = await TaskService.taskDetails({
      id: `${task_id}`,
      user_id: `${user_id}`,
    });

    return res.status(200).json({
      success: true,
      task,
    });
  },
);

/**
 * @route   PATCH /tasks/:task_id
 * @desc    Updates task fields and optionally syncs subtasks
 */
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { user_id, ...updateData } = req.body;

  const updatedTask = await TaskService.update(
    `${task_id}`,
    `${user_id}`,
    updateData,
  );

  return res.status(200).json({
    success: true,
    message: "Task updated successfully",
    task: updatedTask,
  });
});

/**
 * @route   DELETE /tasks/:task_id
 * @desc    Deletes task and all associated subtasks
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { user_id } = req.body;

  await TaskService.deleteById({ id: `${task_id}`, user_id: `${user_id}` });

  return res.status(200).json({
    success: true,
    message: "Task and associated subtasks deleted successfully",
  });
});

/**
 * @route   GET /tasks/user/:user_id
 * @desc    Retrieves all tasks for a specific user
 */
export const getTasksByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;

    // We reuse the service logic for fetching by user
    const tasks = await TaskService.getTasksByUserId({ user_id: `${user_id}` });

    return res.status(200).json({
      success: true,
      tasks,
    });
  },
);

/**
 * @route   GET /tasks/summary
 * @desc    Gets a status-based count summary for the user
 */
export const getTaskSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.body; // Or req.user.id
    const summary = await TaskService.summaryByUser({ user_id: `${user_id}` });

    return res.status(200).json({
      success: true,
      summary,
    });
  },
);

export const deleteSubtask = asyncHandler(
  async (req: Request, _res: Response) => {
    const { _subtask_id } = req.params;
    const { _user_id } = req.body;
  },
);
export const saveSubtask = asyncHandler(
  async (_req: Request, _res: Response) => {},
);
