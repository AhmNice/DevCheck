import { Request, Response } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { BadRequestError } from "./errorHandler.js";
import { TasksFileSchema } from "../schema/task_schema.js";
import { Task } from "../model/Task.js";
import { SubTask } from "../model/SubTask.js";
import { pool } from "../config/db.config.js";
import { User } from "../model/User.js";
import { ProjectSchema } from "../schema/project.schema.js";
import { Project } from "../model/Project.js";

interface FileRequest extends Request {
  file?: Express.Multer.File;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}
export const jsonTaskHandler = asyncHandler(
  async (req: FileRequest, res: Response) => {
    const file = req.file;
    const { user_id } = req.body;
    if (!user_id) {
      throw new BadRequestError("Missing required field: user_id");
    }
    const user = await User.findById(user_id);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (!file) {
      throw new BadRequestError("No file uploaded");
    }
    const fileBuffer = file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestError("File is empty");
    }
    const content = fileBuffer.toString("utf-8");
    const parsedContent = JSON.parse(content);
    const validatedTasks = TasksFileSchema.parse(parsedContent);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const taskData of validatedTasks) {
        const task = new Task({
          title: taskData.title,
          user_id: user_id,
          description: taskData.description,
          due_date: new Date(taskData.due_date),
          status: taskData.status,
          priority: taskData.priority,
        });

        const savedTask = await task.save(client);

        if (taskData.subtasks?.length) {
          for (const subtaskData of taskData.subtasks) {
            const subtask = new SubTask({
              task_id: savedTask._id,
              title: subtaskData.title,
              description: subtaskData.description,
              due_date: new Date(subtaskData.due_date),
              status: subtaskData.status,
            });

            await subtask.save(client);
          }
        }
      }

      await client.query("COMMIT");

      res.status(200).json({
        success: true,
        message: "Tasks imported successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
);
export const jsonProjectHandler = asyncHandler(
  async (req: FileRequest, res: Response) => {
    const file = req.file;
    const { user_id } = req.body;
    if (!user_id) {
      throw new BadRequestError("Missing required field: user_id");
    }
    const user = await User.findById(user_id);
    if (!user) {
      throw new BadRequestError("User not found");
    }
    if (!file) {
      throw new BadRequestError("No file uploaded");
    }
    const fileBuffer = file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new BadRequestError("File is empty");
    }
    const content = fileBuffer.toString("utf-8");
    const parsedContent = JSON.parse(content);
    const validatedProject = ProjectSchema.parse(parsedContent);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const project = new Project({
        user_id: user_id,
        name: validatedProject.name,
        description: validatedProject.description,
        deadline: validatedProject.deadline
          ? new Date(validatedProject.deadline)
          : undefined,
      });

      const savedProject = await project.create(client);

      for (const taskData of validatedProject.tasks) {
        const task = new Task({
          title: taskData.title,
          user_id: user_id,
          description: taskData.description,
          due_date: new Date(taskData.due_date),
          status: taskData.status,
          priority: taskData.priority,
          project_id: savedProject._id,
        });

        const savedTask = await task.save(client);

        if (taskData.subtasks?.length) {
          for (const subtaskData of taskData.subtasks) {
            const subtask = new SubTask({
              task_id: savedTask._id,
              title: subtaskData.title,
              description: subtaskData.description,
              due_date: new Date(subtaskData.due_date),
              status: subtaskData.status,
            });

            await subtask.save(client);
          }
        }
      }
      await client.query("COMMIT");
      res.status(200).json({
        success: true,
        message: "Project imported successfully",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
);
