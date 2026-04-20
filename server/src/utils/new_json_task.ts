import { Request, Response } from "express";
import { asyncHandler } from "./asyncHandler.js";
import { APIError } from "./errorHandler.js";
import { SessionPayload } from "../interface/session.interface.js";
import prisma from "../config/database.js";
import { TasksFileSchema } from "../validation/task_schema.js";
import { User } from "../service/User.service.js";
import { BaseProjectSchema } from "../validation/project.schema.js";
interface FileRequest extends Request {
  file?: Express.Multer.File;
  user?: SessionPayload;
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
}

export const jsonTaskHandler = asyncHandler(
  async (req: FileRequest, res: Response) => {
    const file = req.file;
    const user_id = req.user?.user_id;

    if (!file)
      throw new APIError({ message: "No file uploaded", statusCode: 400 });
    if (!user_id)
      throw new APIError({
        message: "User not authenticated",
        statusCode: 401,
      });

    const user = await prisma.user.findUnique({
      where: { id: user_id },
    });

    if (!user)
      throw new APIError({ message: "User not found", statusCode: 404 });

    const content = file.buffer.toString("utf-8");
    const parsedContent = JSON.parse(content);
    const validatedTasks = TasksFileSchema.parse(parsedContent);

    const results = await prisma.$transaction(async (tx) => {
      const createTasks = await Promise.all(
        validatedTasks.map((task) =>
          tx.task.create({
            data: {
              userId: user_id,
              projectId: task.project_id || null,
              title: task.title,
              description: task.description,
              dueDate: task.due_date ? new Date(task.due_date) : new Date(),
              status: task.status || "PLANNED",
              priority: task.priority || "MEDIUM",
            },
          }),
        ),
      );

      const subTasks = validatedTasks.flatMap((task, index) => {
        const taskId = createTasks[index].id;

        return (task.subtasks || []).map((sub) => ({
          taskId,
          title: sub.title,
          description: sub.description,
          dueDate: sub.due_date
            ? new Date(sub.due_date)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: sub.status || "PLANNED",
        }));
      });

      if (subTasks.length) {
        await tx.subtask.createMany({
          data: subTasks,
        });
      }
      console.log("Created tasks and subtasks successfully");
      return createTasks;
    });
    console.log("Transaction completed, sending response");
    return res.status(200).json({
      success: true,
      data: results,
    });
  },
);
export const jsonProjectHandler = asyncHandler(
  async (req: FileRequest, res: Response) => {
    const file = req.file;
    const user_id = req.user?.user_id;
    if (!user_id)
      throw new APIError({
        message: "User not authenticated",
        statusCode: 401,
      });
    if (!file)
      throw new APIError({ message: "No file uploaded", statusCode: 400 });
    const user = await User.findById(user_id);
    if (!user)
      throw new APIError({ message: "User not found", statusCode: 404 });
    const fileBuffer = file.buffer;
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new APIError({ message: "Invalid file content", statusCode: 400 });
    }
    const content = fileBuffer.toString("utf-8");
    const parsedContent = JSON.parse(content);
    const validatedProjects = BaseProjectSchema.parse(parsedContent);
    const results = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          userId: user_id,
          name: validatedProjects.name,
          description: validatedProjects.description,
          deadline: validatedProjects.deadline
            ? new Date(validatedProjects.deadline)
            : null,
        },
      });
      const tasks =
        validatedProjects.tasks &&
        (await Promise.all(
          validatedProjects.tasks.map((task) =>
            tx.task.create({
              data: {
                title: task.title,
                projectId: project.id,
                userId: user_id,
                description: task.description,
                dueDate: task.due_date ? new Date(task.due_date) : new Date(),
                status: task.status || "PLANNED",
                priority: task.priority || "MEDIUM",
              },
            }),
          ),
        ));
      const subTasks = validatedProjects.tasks.flatMap((task, index) => {
        const taskId = tasks[index].id;
        return (task.subtasks || []).map((sub) => ({
          taskId,
          title: sub.title,
          description: sub.description,
          dueDate: sub.due_date
            ? new Date(sub.due_date)
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: sub.status || "PLANNED",
        }));
      });
      if (subTasks.length) {
        await tx.subtask.createMany({
          data: subTasks,
        });
      }
      return { project, tasks };
    });

    return res.status(200).json({
      success: true,
      data: results,
    });
  },
);
