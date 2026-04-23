import { Pool, PoolClient } from "pg";
import { Status } from "../types/status.type.js";

import {
  Prisma,
  Subtask as PrismaSubtask,
} from "../generated/prisma/client.js";
import { SubtaskInterface } from "../interface/task.interface.js";
import prisma from "../config/database.js";
import { APIError } from "../utils/errorHandler.js";
import { executeSubTaskTransition } from "../helper/task.transition.js";
type subInterface = Pick<
  SubtaskInterface,
  "task_id" | "title" | "description" | "due_date" | "status"
>;
type PrismaTx = Prisma.TransactionClient;

/**
 * @deprecated Use SubTaskService instead. This class is a legacy implementation and may be removed in future versions. Please migrate to SubTaskService for all subtask-related operations.
 */
export class SubTask {
  constructor(parameters: subInterface) {
    Object.assign(this, parameters);
  }

  _id!: string;
  task_id!: string;
  title!: string;
  description?: string;
  due_date!: Date;
  status!: Status;

  private static toPrismaStatus(status: SubtaskInterface["status"]) {
    switch (status) {
      case "IN_PROGRESS":
        return "IN_PROGRESS" as const;
      case "SHIPPED":
        return "SHIPPED" as const;
      default:
        return "BACKLOG" as const;
    }
  }

  private static fromPrismaStatus(status: string): SubtaskInterface["status"] {
    switch (status) {
      case "IN_PROGRESS":
        return "IN_PROGRESS";
      case "SHIPPED":
        return "SHIPPED";
      default:
        return "BACKLOG";
    }
  }

  private static toLegacySubtask(subtask: PrismaSubtask): SubtaskInterface {
    return {
      _id: subtask.id,
      task_id: subtask.taskId,
      title: subtask.title,
      description: subtask.description || undefined,
      due_date: subtask.dueDate || new Date(),
      status: SubTask.fromPrismaStatus(subtask.status),
      created_at: subtask.createdAt,
      updated_at: subtask.updatedAt,
    };
  }

  async save(client?: Pool | PoolClient) {
    try {
      void client;
      const result = await prisma.subtask.create({
        data: {
          taskId: this.task_id,
          title: this.title,
          description: this.description,
          dueDate: this.due_date,
          status: SubTask.toPrismaStatus(this.status),
        },
      });

      return SubTask.toLegacySubtask(result);
    } catch (error) {
      throw new Error("Error saving subtask: " + (error as Error).message);
    }
  }
  static async insertMany(subtasks: SubTask[], client?: Pool | PoolClient) {
    try {
      void client;
      const createdSubtasks = await prisma.$transaction(
        subtasks.map((sub) =>
          prisma.subtask.create({
            data: {
              taskId: sub.task_id,
              title: sub.title,
              description: sub.description,
              dueDate: sub.due_date,
              status: SubTask.toPrismaStatus(sub.status || "BACKLOG"),
            },
          }),
        ),
      );

      return createdSubtasks.map(SubTask.toLegacySubtask);
    } catch (error) {
      throw new Error("Error saving subtasks: " + (error as Error).message);
    }
  }
  static async getByTaskId(
    client: Pool | PoolClient | undefined,
    task_id: string,
  ) {
    try {
      void client;
      const result = await prisma.subtask.findMany({
        where: {
          taskId: task_id,
        },
      });
      return result.map(SubTask.toLegacySubtask);
    } catch (error) {
      throw new Error("Error fetching subtasks: " + (error as Error).message);
    }
  }
  static async deleteById(subtask_id: string, client?: Pool | PoolClient) {
    try {
      void client;
      await prisma.subtask.delete({
        where: {
          id: subtask_id,
        },
      });
    } catch (error) {
      throw new Error("Error deleting subtask: " + (error as Error).message);
    }
  }
}
export class SubTaskService {
  private static toLegacySubtask(subtask: PrismaSubtask): SubtaskInterface {
    return {
      _id: subtask.id,
      task_id: subtask.taskId,
      title: subtask.title,
      description: subtask.description || undefined,
      due_date: subtask.dueDate || new Date(),
      status: subtask.status,
      created_at: subtask.createdAt,
      updated_at: subtask.updatedAt,
    };
  }
  static async create({
    payload,
    tx = prisma as any,
    user_id,
  }: {
    payload: subInterface;
    tx: PrismaTx;
    user_id: string;
  }) {
    const result = await tx.$transaction(async (childTx) => {
      const taskResult = await childTx.task.findFirst({
        where: { userId: user_id, id: payload.task_id },
      });
      if (!taskResult) {
        throw new APIError({
          message: "No Task Found",
          statusCode: 404,
          code: "NO_TASK_FOUND",
        });
      }
      const createdTask = await childTx.subtask.create({
        data: {
          taskId: payload.task_id ?? payload.task_id,
          title: payload.title || "No Title",
          description: payload.description || "No Description",
          dueDate: payload.due_date ?? new Date(payload.due_date),
          status: payload.status || "BACKLOG",
        },
      });

      return createdTask;
    });
    return result;
  }
  static async insertMany(
    subTasks: subInterface[],
    tx: PrismaTx,
    user_id: string,
  ) {
    const createdSubTasks = await tx.$transaction(async (childTx) => {
      const taskIds = subTasks.map((st) => st.task_id);
      const existingTasks = await childTx.task.findMany({
        where: { userId: user_id, id: { in: taskIds } },
        select: { id: true },
      });

      const existingTaskIds = new Set(existingTasks.map((t) => t.id));

      const validSubTasks = subTasks.filter((st) =>
        existingTaskIds.has(st.task_id),
      );
      const subtaskData = validSubTasks.map((st) => ({
        taskId: st.task_id,
        title: st.title || "Untitled Subtask",
        description: st.description || "",
        dueDate: st.due_date ? new Date(st.due_date) : new Date(),
        status: st.status || "BACKLOG",
      }));
      return await childTx.subtask.createMany({ data: subtaskData });
    });
    return SubTaskService.toLegacySubtask(createdSubTasks as any);
  }
  static async transitionStatus({
    subTaskId,
    newStatus,
    userId,
  }: {
    subTaskId: string;
    newStatus: Status;
    userId: string;
  }) {
    const updatedSubTask = await executeSubTaskTransition({
      subtaskId: subTaskId,
      userId,
      newStatus,
    });
    return SubTaskService.toLegacySubtask(updatedSubTask);
  }
  static async subTaskDetails(id: string, user_id: string) {
    const subtask = await prisma.subtask.findFirst({
      where: {
        id,
        task: {
          userId: user_id,
        },
      },
    });

    if (!subtask) {
      throw new APIError({
        message: "Subtask not found",
        statusCode: 404,
        code: "SUBTASK_NOT_FOUND",
      });
    }

    return SubTaskService.toLegacySubtask(subtask);
  }
  static async updateById(
    id: string,
    user_id: string,
    updateData: Partial<subInterface>,
  ) {
    const updatedSubtask = await prisma.subtask.updateMany({
      where: {
        id,
        task: {
          userId: user_id,
        },
      },
      data: {
        title: updateData.title,
        description: updateData.description,
        dueDate: updateData.due_date
          ? new Date(updateData.due_date)
          : undefined,
        status: updateData.status,
      },
    });
    return SubTaskService.toLegacySubtask(updatedSubtask as any);
  }
  static async deleteById(id: string, tx: PrismaTx) {
    const deletedSubtask = await tx.subtask.delete({ where: { id } });
    return SubTaskService.toLegacySubtask(deletedSubtask);
  }
}
