import prisma from "../config/database.js";
import { Pool, PoolClient } from "pg";
import { APIError, BadRequestError } from "../utils/errorHandler.js";
import {
  Prisma,
  Task as PrismaTask,
  Subtask as PrismaSubtask,
} from "../generated/prisma/client.js";
import {
  TaskInterface,
  SubtaskInterface,
} from "../interface/task.interface.js";
import { checkStatusTransitionGuards } from "../helper/task.guard.js";
import { canTransition } from "../helper/task.transition.js";

type PrismaTx = Prisma.TransactionClient;

export class TaskService {
  // --- Mappers ---
  private static toLegacyTask(task: PrismaTask): TaskInterface {
    return {
      _id: task.id,
      user_id: task.userId,
      project_id: task.projectId ?? undefined,
      title: task.title,
      description: task.description ?? undefined,
      source: task.source ?? undefined,
      source_id: task.sourceId ?? undefined,
      due_date: task.dueDate ?? new Date(),
      status: task.status as any,
      priority: task.priority as any,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }

  private static toLegacySubtask(sub: PrismaSubtask): SubtaskInterface {
    return {
      _id: sub.id,
      task_id: sub.taskId,
      title: sub.title,
      description: sub.description ?? "",
      due_date: sub.dueDate ?? new Date(),
      status: sub.status as any,
      created_at: sub.createdAt,
      updated_at: sub.updatedAt,
    };
  }

  // --- Helper Date Methods ---
  private static weekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private static toDateKey(date: Date) {
    return date.toISOString().split("T")[0];
  }

  // --- Core CRUD Methods ---

  static async create(payload: any, tx: PrismaTx = prisma as any) {
    return await (tx as any).$transaction(async (childTx: PrismaTx) => {
      const result = await childTx.task.create({
        data: {
          userId: payload.user_id,
          projectId: payload.project_id || null,
          title: payload.title,
          description: payload.description,
          dueDate: payload.due_date,
          status: payload.status,
          priority: payload.priority,
          source: payload.source,
          sourceId: payload.source_id,
          githubIssueId: payload.github_issue_id || null, // Keeping GitHub support
        },
      });

      if (payload.subtasks?.length) {
        const subTaskData = payload.subtasks.map((sub: any) => ({
          taskId: result.id,
          title: sub.title ?? "Untitled Subtask",
          description: sub.description ?? "",
          dueDate: sub.due_date
            ? new Date(sub.due_date)
            : new Date(Date.now() + 7 * 86400000),
          status: sub.status ?? "BACKLOG",
        }));
        await childTx.subtask.createMany({ data: subTaskData });
      }
      return this.toLegacyTask(result);
    });
  }

  static async insertMany(tasks: any[], tx: PrismaTx = prisma as any) {
    return await (tx as any).$transaction(async (childTx: PrismaTx) => {
      const createdTasks = await Promise.all(
        tasks.map((t) =>
          childTx.task.create({
            data: {
              userId: t.user_id,
              projectId: t.project_id || null,
              title: t.title,
              description: t.description,
              dueDate: t.due_date,
              status: t.status,
              priority: t.priority,
            },
          }),
        ),
      );

      const subtasks = tasks.flatMap((t, i) =>
        (t.subtasks || []).map((s: any) => ({
          taskId: createdTasks[i].id,
          title: s.title ?? "Untitled Subtask",
          status: s.status,
          dueDate: s.due_date ? new Date(s.due_date) : new Date(),
        })),
      );

      if (subtasks.length) await childTx.subtask.createMany({ data: subtasks });
      return createdTasks.map(this.toLegacyTask);
    });
  }

  static async taskDetails({
    id,
    user_id,
    tx = prisma as any,
  }: {
    id: string;
    user_id: string;
    tx?: PrismaTx;
  }) {
    const task = await tx.task.findUnique({
      where: { id, userId: user_id },
      include: {
        user: { select: { name: true, email: true } },
        subtasks: true,
      },
    });

    if (!task) return null;

    return {
      ...this.toLegacyTask(task),
      started_at: task.startedAt || undefined,
      lastActive: task.lastActiveAt || undefined,
      created_by: task.user
        ? { name: task.user.name, email: task.user.email }
        : null,
      subtasks: task.subtasks.map(this.toLegacySubtask),
      completed_subtasks: task.subtasks.filter((s) => s.status === "COMPLETED")
        .length,
      total_subtasks: task.subtasks.length,
      isOverDue: task.dueDate
        ? task.dueDate < new Date() && task.status !== "SHIPPED"
        : false,
      shipped_at: task.shippedAt || undefined,
    };
  }
  static async getTasksByUserId({
    user_id,
    tx = prisma as any,
    limit = "50",
    page = "1",
  }: {
    user_id: string;
    tx?: PrismaTx;
    limit?: string;
    page?: string;
  }) {
    const take = Math.max(1, Number(limit));
    const skip = (Math.max(1, Number(page)) - 1) * take;

    const userTasks = await tx.task.findMany({
      where: { userId: user_id },
      include: {
        user: { select: { name: true, email: true } },
        subtasks: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });

    const now = new Date();

    // Mapping in one pass to keep it O(N)
    return userTasks.map((task) => {
      const legacyTask = this.toLegacyTask(task);

      // Derived fields
      const total_subtasks = task.subtasks.length;
      const completed_subtasks = task.subtasks.filter(
        (s) => s.status === "COMPLETED",
      ).length;
      const isOverDue = !!(
        task.dueDate &&
        task.dueDate < now &&
        task.status !== "SHIPPED"
      );

      return {
        ...legacyTask,
        created_by: task.user
          ? { name: task.user.name, email: task.user.email }
          : null,
        isOverDue,
        subtasks: task.subtasks.map(this.toLegacySubtask),
        completed_subtasks,
        total_subtasks,
        started_at: task.startedAt || undefined,
        lastActive: task.lastActiveAt || undefined,
        shipped_at: task.shippedAt || undefined,
      };
    });
  }
  static async deleteById({
    id,
    user_id,
    tx = prisma as any,
  }: {
    id: string;
    user_id: string;
    tx?: PrismaTx;
  }) {
    await (tx as any).$transaction(async (childTx: PrismaTx) => {
      await childTx.subtask.deleteMany({ where: { taskId: id } });
      await childTx.task.delete({ where: { id, userId: user_id } });
    });
  }
  static async update(
    id: string,
    userId: string,
    data: any,
    tx: PrismaTx = prisma as any,
  ) {
    // Use the existing transaction if provided, or start a new one
    return await (tx as any).$transaction(async (childTx: PrismaTx) => {
      // 1. Fetch existing task to check ownership and current status
      const existing = await childTx.task.findUnique({ where: { id, userId } });
      if (!existing) {
        throw new APIError({
          message: "Task not found",
          statusCode: 404,
          code: "TASK_NOT_FOUND",
        });
      }

      const nextStatus = data.status ?? existing.status;

      // 2. Logic Guard: Check if the state machine allows this transition (e.g., BACKLOG -> SHIPPED might be blocked)
      const { allowed: transitionAllowed, reason: transitionReason } =
        canTransition({
          fromStatus: existing.status,
          toStatus: nextStatus,
        });

      if (!transitionAllowed) {
        throw new APIError({
          message: transitionReason || "Invalid status transition",
          statusCode: 400,
          code: "INVALID_STATUS_TRANSITION",
        });
      }

      // 3. Database Guard: Check WIP (Work-In-Progress) limits
      const validationResult = await checkStatusTransitionGuards({
        tx: childTx,
        taskId: id,
        fromStatus: existing.status,
        toStatus: nextStatus,
        userId,
      });

      if (!validationResult.allowed) {
        throw new APIError({
          message: validationResult.reason || "Status transition not allowed",
          statusCode: 400,
          code: "WIP_LIMIT_EXCEEDED",
        });
      }

      // 4. Update parent task
      await childTx.task.update({
        where: { id },
        data: {
          title: data.title ?? existing.title,
          description: data.description ?? existing.description,
          dueDate: data.due_date ?? existing.dueDate,
          status: nextStatus,
          priority: data.priority ?? existing.priority,
        },
      });

      // 5. Sync subtasks (Delete/Create pattern)
      if (data.subtasks) {
        await childTx.subtask.deleteMany({ where: { taskId: id } });

        if (data.subtasks.length > 0) {
          const subtaskData = data.subtasks.map((sub: any) => ({
            taskId: id,
            title: sub.title ?? "Untitled Subtask",
            description: sub.description ?? "",
            dueDate: sub.due_date
              ? new Date(sub.due_date)
              : new Date(Date.now() + 7 * 86400000),
            status: sub.status ?? "BACKLOG",
          }));
          await childTx.subtask.createMany({ data: subtaskData });
        }
      }

      // 6. Return refreshed details using the same transaction
      return this.taskDetails({ id, user_id: userId, tx: childTx });
    });
  }

  static async findByGithubIssue({
    github_issue_id,
    user_id,
    tx = prisma as any,
  }: {
    github_issue_id: string;
    user_id: string;
    tx?: PrismaTx;
  }) {
    const task = await tx.task.findFirst({
      where: { githubIssueId: github_issue_id, userId: user_id },
    });
    if (!task)
      throw new APIError({
        message: "Task not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    return this.toLegacyTask(task);
  }

  static async summaryByUser({
    user_id,
    tx = prisma as any,
  }: {
    user_id: string;
    tx?: PrismaTx;
  }) {
    const tasks = await tx.task.findMany({
      where: { userId: user_id },
      select: { status: true, dueDate: true },
    });

    const counts = new Map<string, number>();
    const now = new Date();

    for (const task of tasks) {
      const statusGroup =
        task.status !== "SHIPPED" && task.dueDate && task.dueDate < now
          ? "overdue"
          : task.status;
      counts.set(statusGroup, (counts.get(statusGroup) || 0) + 1);
    }

    return Array.from(counts.entries()).map(([status_group, count]) => ({
      status_group,
      count,
    }));
  }

  static async weeklySummaryByUserId({
    user_id,
    tx = prisma as any,
  }: {
    user_id: string;
    tx?: PrismaTx;
  }) {
    const now = new Date();
    const fourWeeksAgo = new Date(now);
    fourWeeksAgo.setDate(now.getDate() - 28);

    const tasks = await tx.task.findMany({
      where: { userId: user_id, dueDate: { gte: fourWeeksAgo } },
      select: { status: true, dueDate: true },
    });

    const counts = new Map<string, number>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const weekStart = this.weekStart(task.dueDate).toISOString();
      const statusGroup =
        task.status !== "SHIPPED" && task.dueDate < now
          ? "overdue"
          : task.status;
      const key = `${weekStart}|${statusGroup}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([key, count]) => {
        const [week_start, status_group] = key.split("|");
        return { week_start, status_group, count };
      })
      .sort(
        (a, b) =>
          new Date(b.week_start).getTime() - new Date(a.week_start).getTime(),
      );
  }

  static async currentWeekProgressByUserId({
    user_id,
    tx = prisma as any,
  }: {
    user_id: string;
    tx?: PrismaTx;
  }) {
    const now = new Date();
    const startOfWeek = this.weekStart(now);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const tasks = await tx.task.findMany({
      where: { userId: user_id, dueDate: { gte: startOfWeek, lte: endOfWeek } },
      select: { dueDate: true },
    });

    const dailyCounts = new Map<string, number>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = this.toDateKey(task.dueDate);
      dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
    }

    const result = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      const key = this.toDateKey(day);
      result.push({
        day: day.toISOString(),
        day_name: day.toLocaleDateString("en-US", { weekday: "short" }),
        task_count: dailyCounts.get(key) || 0,
      });
    }
    return result;
  }
}
/**
 *
 * @deprecated use TaskService instead of directly using Task model for better transaction management and separation of concerns
 */
export class Task {
  constructor(parameters: TaskInterface) {
    Object.assign(this, parameters);
  }

  title!: string;
  description?: string;
  due_date!: Date;
  status!:
    | "BACKLOG"
    | "PLANNED"
    | "IN_PROGRESS"
    | "IN_REVIEW"
    | "SHIPPED"
    | "BLOCKED"
    | "COMPLETED";
  priority!: "LOW" | "MEDIUM" | "HIGH";
  user_id!: string;
  project_id?: string;
  source?: string;
  source_id?: string;
  subtasks?: Partial<SubtaskInterface[]>;

  private static toPrismaStatus(status: TaskInterface["status"]) {
    switch (status) {
      case "IN_PROGRESS":
        return "IN_PROGRESS" as const;
      case "SHIPPED":
        return "SHIPPED" as const;
      case "PLANNED":
        return "PLANNED" as const;
      case "COMPLETED":
        return "COMPLETED" as const;
      default:
        return "BACKLOG" as const;
    }
  }

  private static fromPrismaStatus(status: string): TaskInterface["status"] {
    switch (status) {
      case "IN_PROGRESS":
        return "IN_PROGRESS" as const;
      case "SHIPPED":
        return "SHIPPED" as const;
      case "PLANNED":
        return "PLANNED" as const;
      case "COMPLETED":
        return "COMPLETED" as const;
      default:
        return "BACKLOG" as const;
    }
  }

  private static toPrismaPriority(priority: TaskInterface["priority"]) {
    switch (priority) {
      case "HIGH":
        return "HIGH" as const;
      case "MEDIUM":
        return "MEDIUM" as const;
      default:
        return "LOW" as const;
    }
  }

  private static fromPrismaPriority(
    priority: string,
  ): TaskInterface["priority"] {
    switch (priority) {
      case "HIGH":
        return "HIGH";
      case "MEDIUM":
        return "MEDIUM";
      default:
        return "LOW";
    }
  }

  private static toLegacyTask(task: PrismaTask): TaskInterface {
    return {
      _id: task.id,
      user_id: task.userId,
      project_id: task.projectId,
      title: task.title,
      description: task.description || undefined,
      source: task.source || undefined,
      source_id: task.sourceId || undefined,
      due_date: task.dueDate || new Date(),
      status: Task.fromPrismaStatus(task.status),
      priority: Task.fromPrismaPriority(task.priority),
      created_at: task.createdAt,
      updated_at: task.updatedAt,
    };
  }

  private static toLegacySubtask(subtask: PrismaSubtask) {
    return {
      _id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      due_date: subtask.dueDate || new Date(),
      status: Task.fromPrismaStatus(subtask.status),
    };
  }

  private static weekStart(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day + 6) % 7;
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private static toDateKey(date: Date) {
    return date.toISOString().split("T")[0];
  }

  async save(tx = prisma) {
    try {
      const result = await tx.task.create({
        data: {
          userId: this.user_id,
          projectId: this.project_id || null,
          title: this.title,
          description: this.description,
          dueDate: this.due_date,
          status: Task.toPrismaStatus(this.status),
          priority: Task.toPrismaPriority(this.priority),
          source: this.source,
          sourceId: this.source_id,
        },
      });

      return Task.toLegacyTask(result);
    } catch (error) {
      throw new Error("Error saving task: " + (error as Error).message);
    }
  }
  static async insertMany(tasks: Task[], client?: Pool | PoolClient) {
    /**
     * @deprecated use TaskService.insertMany instead
     */
    try {
      void client;
      const createdTasks = await prisma.$transaction(
        tasks.map((task) =>
          prisma.task.create({
            data: {
              userId: task.user_id,
              projectId: task.project_id || null,
              title: task.title,
              description: task.description,
              dueDate: task.due_date,
              status: Task.toPrismaStatus(task.status),
              priority: Task.toPrismaPriority(task.priority),
              source: task.source || null,
              sourceId: task.source_id || null,
            },
          }),
        ),
      );

      return createdTasks.map(Task.toLegacyTask);
    } catch (error) {
      throw new Error("Error saving tasks: " + (error as Error).message);
    }
  }

  static async findById(client: Pool | PoolClient | undefined, id: string) {
    try {
      void client;
      const result = await prisma.task.findUnique({
        where: { id },
      });
      return result ? Task.toLegacyTask(result) : null;
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding task: " + (error as Error).message,
      });
    }
  }
  static async getTaskByUserId(user_id: string) {
    try {
      const tasks = await prisma.task.findMany({
        where: { userId: user_id },
        include: {
          user: { select: { name: true } },
          subtasks: { select: { status: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return tasks.map((task) => ({
        ...Task.toLegacyTask(task),
        created_by: task.user.name,
        completed_subtasks: task.subtasks.filter(
          (sub) => Task.fromPrismaStatus(sub.status) === "SHIPPED",
        ).length,
      }));
    } catch (error) {
      throw new BadRequestError({
        message: "Error finding tasks: " + (error as Error).message,
      });
    }
  }
  static async deleteById(task_id: string, client?: Pool | PoolClient) {
    try {
      void client;
      await prisma.task.delete({
        where: { id: task_id },
      });
    } catch (error) {
      throw new BadRequestError({
        message: "Error deleting task: " + (error as Error).message,
      });
    }
  }
  static async getTaskByIdWithSubtasks(task_id: string) {
    try {
      const result = await prisma.task.findUnique({
        where: { id: task_id },
        include: {
          user: { select: { name: true } },
          subtasks: true,
        },
      });
      if (!result) {
        return null;
      }

      return {
        ...Task.toLegacyTask(result),
        created_by: result.user.name,
        subtasks: result.subtasks.map(Task.toLegacySubtask),
      };
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error retrieving task with subtasks: " + (error as Error).message,
      });
    }
  }
  static async updateById(
    task_id: string,
    updates: Partial<TaskInterface>,
    client?: Pool | PoolClient,
  ) {
    try {
      void client;
      const data: {
        title?: string;
        description?: string;
        dueDate?: Date;
        status?:
          | "BACKLOG"
          | "IN_PROGRESS"
          | "SHIPPED"
          | "PLANNED"
          | "COMPLETED";
        priority?: "LOW" | "MEDIUM" | "HIGH";
        userId?: string;
        projectId?: string | null;
        source?: string;
        sourceId?: string;
      } = {};
      if (updates.user_id === undefined) {
        throw new BadRequestError({
          message: "user_id is required for updating task",
        });
      }
      if (updates.title !== undefined) data.title = updates.title;
      if (updates.description !== undefined)
        data.description = updates.description;
      if (updates.due_date !== undefined) data.dueDate = updates.due_date;
      if (updates.status !== undefined)
        data.status = Task.toPrismaStatus(updates.status);
      if (updates.priority !== undefined) {
        data.priority = Task.toPrismaPriority(updates.priority);
      }
      if (updates.user_id !== undefined) data.userId = updates.user_id;
      if (updates.project_id !== undefined)
        data.projectId = updates.project_id || null;
      if (updates.source !== undefined) data.source = updates.source;
      if (updates.source_id !== undefined) data.sourceId = updates.source_id;

      if (Object.keys(data).length === 0) {
        throw new BadRequestError({ message: "No updates provided" });
      }

      const result = await prisma.task.update({
        where: { id: task_id, userId: updates.user_id },
        data,
      });

      return Task.toLegacyTask(result);
    } catch (error) {
      throw new BadRequestError({
        message: "Error updating task: " + (error as Error).message,
        errors: [],
      });
    }
  }
  static async findByGitHubIssue(
    client: Pool | PoolClient | undefined,
    { github_issue_id, user_id }: { github_issue_id: string; user_id: string },
  ) {
    try {
      void client;
      const result = await prisma.task.findFirst({
        where: {
          sourceId: github_issue_id,
          userId: user_id,
          status: {
            not: "SHIPPED",
          },
        },
      });

      return result ? Task.toLegacyTask(result) : null;
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error finding task by GitHub issue: " + (error as Error).message,
        errors: [],
      });
    }
  }
  static async summaryByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    try {
      void client;
      const tasks = await prisma.task.findMany({
        where: { userId: user_id },
        select: {
          status: true,
          dueDate: true,
        },
      });

      const counts = new Map<string, number>();
      const now = new Date();
      for (const task of tasks) {
        const status = Task.fromPrismaStatus(task.status);
        const statusGroup =
          status !== "SHIPPED" && task.dueDate && task.dueDate < now
            ? "overdue"
            : status;
        counts.set(statusGroup, (counts.get(statusGroup) || 0) + 1);
      }

      return Array.from(counts.entries()).map(([status_group, count]) => ({
        status_group,
        count,
      }));
    } catch (error) {
      throw new BadRequestError({
        message: "Error retrieving task summary: " + (error as Error).message,
        errors: [],
      });
    }
  }
  static async summaryByProjectId({
    client,
    project_id,
  }: {
    client: Pool | PoolClient;
    project_id: string;
  }) {
    try {
      void client;
      const tasks = await prisma.task.findMany({
        where: { projectId: project_id },
        select: { status: true },
      });

      const counts = new Map<string, number>();
      for (const task of tasks) {
        const status = Task.fromPrismaStatus(task.status);
        counts.set(status, (counts.get(status) || 0) + 1);
      }

      return Array.from(counts.entries()).map(([status, count]) => ({
        status,
        count,
      }));
    } catch (error) {
      throw new BadRequestError({
        message: "Error retrieving task summary: " + (error as Error).message,
        errors: [],
      });
    }
  }
  static async weeklySummaryByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    try {
      void client;
      const now = new Date();
      const fourWeeksAgo = new Date(now);
      fourWeeksAgo.setDate(now.getDate() - 28);

      const tasks = await prisma.task.findMany({
        where: {
          userId: user_id,
          dueDate: {
            gte: fourWeeksAgo,
          },
        },
        select: {
          status: true,
          dueDate: true,
        },
      });

      const counts = new Map<string, number>();
      for (const task of tasks) {
        if (!task.dueDate) continue;
        const weekStart = Task.weekStart(task.dueDate).toISOString();
        const status = Task.fromPrismaStatus(task.status);
        const statusGroup =
          status !== "SHIPPED" && task.dueDate < now ? "overdue" : status;
        const key = `${weekStart}|${statusGroup}`;
        counts.set(key, (counts.get(key) || 0) + 1);
      }

      return Array.from(counts.entries())
        .map(([key, count]) => {
          const [week_start, status_group] = key.split("|");
          return { week_start, status_group, count };
        })
        .sort(
          (a, b) =>
            new Date(b.week_start).getTime() - new Date(a.week_start).getTime(),
        );
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error retrieving weekly task summary: " + (error as Error).message,
        errors: [],
      });
    }
  }
  static async currentWeekProgressByUserId({
    client,
    user_id,
  }: {
    client: Pool | PoolClient;
    user_id: string;
  }) {
    try {
      void client;
      const now = new Date();
      const startOfWeek = Task.weekStart(now);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const tasks = await prisma.task.findMany({
        where: {
          userId: user_id,
          dueDate: {
            gte: startOfWeek,
            lte: endOfWeek,
          },
        },
        select: {
          dueDate: true,
        },
      });

      const dailyCounts = new Map<string, number>();
      for (const task of tasks) {
        if (!task.dueDate) continue;
        const key = Task.toDateKey(task.dueDate);
        dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
      }

      const result = [];
      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const key = Task.toDateKey(day);
        result.push({
          day: day.toISOString(),
          day_name: day.toLocaleDateString("en-US", { weekday: "short" }),
          task_count: dailyCounts.get(key) || 0,
        });
      }

      return result;
    } catch (error) {
      throw new BadRequestError({
        message:
          "Error retrieving current week progress: " + (error as Error).message,
        errors: [],
      });
    }
  }
}
