import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { BadRequestError } from "../utils/errorHandler.js";
import { Task } from "../model/Task.js";
import { SubTask } from "../model/SubTask.js";
import { User } from "../model/User.js";
import { pool } from "../config/db.config.js";
import { TaskInterface } from "../interface/task.interface.js";
import { Project } from "../model/Project.js";

const client = await pool.connect();
export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const {
    user_id,
    title,
    description,
    due_date,
    status,
    priority,
    project_id,
  } = req.body;
  if (!title || !due_date || !user_id) {
    throw new BadRequestError(
      "Missing required fields: title, due_date, user_id, status, priority",
    );
  }
  const user = await User.findById(user_id);
  if (!user) {
    throw new BadRequestError("User not found");
  }
  const parsedDate = new Date(due_date);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestError("Invalid due_date format");
  }
  let project = null;
  if (project_id) {
    project = await Project.findById(`${project_id}`);
    if (!project) {
      throw new BadRequestError("Project not found");
    }
  }
  const client = await pool.connect();
  const task = new Task({
    user_id,
    title,
    description,
    due_date: parsedDate,
    status: status || "pending",
    priority: priority || "normal",
    project_id: project_id || null,
  });

  const savedTask = await task.save(client);
  res.status(201).json({
    success: true,
    message: "Task created successfully",
    task: savedTask,
  });
});
export const saveSubtask = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { title, description, due_date, status } = req.body;

  if (!title || !due_date) {
    throw new BadRequestError("Missing required fields: title and due_date");
  }

  const parsedDate = new Date(due_date);
  if (isNaN(parsedDate.getTime())) {
    throw new BadRequestError("Invalid due_date format");
  }

  const allowedStatus = ["pending", "in_progress", "completed"];
  const finalStatus = status || "pending";

  if (!allowedStatus.includes(finalStatus)) {
    throw new BadRequestError("Invalid status value");
  }

  const task = await Task.findById(client, `${task_id}`);
  if (!task) {
    throw new BadRequestError("Task not found");
  }

  const subtask = new SubTask({
    task_id: `${task_id}`,
    title: title,
    description: description,
    due_date: parsedDate,
    status: finalStatus,
  });

  const savedSubtask = await subtask.save(client);
  client.release();
  res.status(201).json({
    success: true,
    message: "Subtask created successfully",
    subtask: savedSubtask,
  });
});
export const getSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const task = await Task.findById(client, `${task_id}`);
  if (!task) {
    throw new BadRequestError("Task not found");
  }
  const subtasks = await SubTask.getByTaskId(client, `${task_id}`);
  client.release();
  res.status(200).json({
    success: true,
    subtasks: subtasks,
  });
});
export const getTaskWithSubtasks = asyncHandler(
  async (req: Request, res: Response) => {
    const { task_id } = req.params;
    const task = await Task.getTaskByIdWithSubtasks(`${task_id}`);
    if (!task) {
      throw new BadRequestError("Task not found");
    }
    res.status(200).json({
      success: true,
      task: task,
    });
  },
);
export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  const { status, priority } = req.body;
  if (!status || !priority) {
    throw new BadRequestError("Missing required fields: status and priority");
  }
  let updates: Partial<TaskInterface> = {};
  if (status) {
    updates.status = status;
  }
  if (priority) {
    updates.priority = priority;
  }
  const updatedTask = await Task.updateById(`${task_id}`, updates);
  res.status(200).json({
    success: true,
    task: updatedTask,
  });
});
export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const { task_id } = req.params;
  await Task.deleteById(`${task_id}`);
  res.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
});
export const deleteSubtask = asyncHandler(
  async (req: Request, res: Response) => {
    const { subtask_id } = req.params;
    await SubTask.deleteById(`${subtask_id}`);
    res.status(200).json({
      success: true,
      message: "Subtask deleted successfully",
    });
  },
);
export const getTasksByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const user = await User.findById(`${user_id}`);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    const tasks = await Task.getTaskByUserId(`${user_id}`);
    res.status(200).json({
      success: true,
      tasks: tasks,
    });
  },
);
