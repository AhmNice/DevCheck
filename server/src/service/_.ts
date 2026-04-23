import {
  Prisma,
  Subtask as PrismaSubtask,
} from "../generated/prisma/client.js";
import { SubtaskInterface } from "../interface/task.interface.js";
import prisma from "../config/database.js";
import { APIError } from "../utils/errorHandler.js";
type subInterface = Pick<
  SubtaskInterface,
  "task_id" | "title" | "description" | "due_date" | "status"
>;
type PrismaTx = Prisma.TransactionClient;
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
  static async deleteById(id: string, tx: PrismaTx) {
    const deletedSubtask = await tx.subtask.delete({ where: { id } });
    return SubTaskService.toLegacySubtask(deletedSubtask);
  }
}
