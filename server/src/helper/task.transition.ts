import { Status } from "../types/status.type.js";
import prisma from "../config/database.js";
import { APIError } from "../utils/errorHandler.js";
import { checkStatusTransitionGuards } from "./task.guard.js";
import { Prisma } from "../generated/prisma/client.js";

type TaskStatus = Status;
export const allowedTransitions: Record<Status, readonly Status[]> = {
  BACKLOG: ["PLANNED"],
  PLANNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED"],
  BLOCKED: ["IN_PROGRESS"],
  IN_REVIEW: ["SHIPPED", "IN_PROGRESS"],
  SHIPPED: [],
};
interface response {
  allowed: boolean;
  reason: string;
}
/**
 * @description Validates if a transition from one status to another is allowed based on predefined rules.
 * This function is a pure validator and does not perform any side effects or database operations.
 * It should be used as part of the transition execution process to ensure that only valid status changes are performed.
 */
export const canTransition = ({
  fromStatus,
  toStatus,
}: {
  fromStatus: Status;
  toStatus: Status;
}): response => {
  const allowedNextStatuses = allowedTransitions[fromStatus];

  if (!allowedNextStatuses) {
    throw new APIError({
      message: `Invalid fromStatus: ${fromStatus}`,
      statusCode: 400,
    });
  }

  return {
    allowed: allowedNextStatuses.includes(toStatus),
    reason: allowedNextStatuses.includes(toStatus)
      ? ""
      : `Transition from ${fromStatus} to ${toStatus} is not allowed`,
  };
};
/**
 * @description Executes a task status transition with all necessary checks and side effects.
 * This is the single source of truth for all task status changes and must be used for any update to task status to ensure consistency and integrity of the workflow.
 */
export const executeTaskTransition = async ({
  taskId,
  userId,
  newStatus,
  blockedReason,
}: {
  taskId: string;
  userId: string;
  newStatus: TaskStatus;
  blockedReason?: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch task
    const existing = await tx.task.findUnique({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!existing) {
      throw new APIError({
        message: "Task not found",
        statusCode: 404,
        code: "TASK_NOT_FOUND",
      });
    }

    const nextStatus = newStatus ?? existing.status;

    // 2. Same status → no-op
    if (existing.status === nextStatus) {
      return existing;
    }
    if (newStatus === "SHIPPED") {
      const subtaskStatuses = await checkSubTaskStatusBeforeTransition({
        tx,
        taskId,
        userId,
      });
      if (
        subtaskStatuses.some(
          (status) => status !== "SHIPPED" && status !== "IN_REVIEW",
        )
      ) {
        throw new APIError({
          message:
            "All subtasks must be completed before transitioning to SHIPPED",
          statusCode: 400,
          code: "SUBTASKS_NOT_COMPLETED",
        });
      }
    }
    // 3. Terminal state protection
    if (existing.status === "SHIPPED") {
      throw new APIError({
        message: "Completed tasks cannot be modified",
        statusCode: 400,
        code: "TASK_ALREADY_COMPLETED",
      });
    }

    // 4. Transition validation
    const { allowed, reason } = canTransition({
      fromStatus: existing.status,
      toStatus: nextStatus,
    });

    if (!allowed) {
      throw new APIError({
        message: reason || "Invalid status transition",
        statusCode: 400,
        code: "INVALID_STATUS_TRANSITION",
      });
    }

    // 5. Guard checks (WIP, etc.)
    const guardResult = await checkStatusTransitionGuards({
      tx,
      taskId,
      fromStatus: existing.status,
      toStatus: nextStatus,
      userId,
    });

    if (!guardResult.allowed) {
      throw new APIError({
        message: guardResult.reason || "Status transition not allowed",
        statusCode: 400,
        code: "WIP_LIMIT_EXCEEDED",
      });
    }

    // 6. Side effects (controlled)
    const now = new Date();

    // enforce blocked reason
    if (nextStatus === "BLOCKED" && !blockedReason) {
      throw new APIError({
        message: "Blocked tasks require a reason",
        statusCode: 400,
        code: "BLOCKED_REASON_REQUIRED",
      });
    }

    let startedAt = existing.startedAt;
    let shippedAt = existing.shippedAt;
    let lastActiveAt = existing.lastActiveAt;

    if (nextStatus === "IN_PROGRESS" && !startedAt) {
      startedAt = now;
    }

    if (["IN_PROGRESS", "IN_REVIEW"].includes(nextStatus)) {
      lastActiveAt = now;
    }

    if (nextStatus === "SHIPPED" && !shippedAt) {
      shippedAt = now;
    }

    const updateData = {
      status: nextStatus,
      updatedAt: now,
      startedAt,
      shippedAt,
      lastActiveAt,
      blockedReason: nextStatus === "BLOCKED" ? blockedReason : null,
    };

    // 7. Update
    const updated = await tx.task.update({
      where: {
        id: taskId,
        userId: userId,
      },
      data: updateData,
    });

    return updated;
  });
};
/**
 * @description Checks the status of all subtasks before allowing a parent task to transition to SHIPPED.
 * Should be called within a transaction before executing the parent task transition.
 */
export const checkSubTaskStatusBeforeTransition = async ({
  tx,
  taskId,
  userId,
}: {
  tx: Prisma.TransactionClient;
  taskId: string;
  userId: string;
}): Promise<Status[]> => {
  const subtasks = await tx.subtask.findMany({
    where: {
      taskId: taskId,
      task: {
        userId: userId,
      },
    },
  });
  return subtasks.map((subtask) => subtask.status);
};
/**
 * @description Syncs parent task status based on its subtasks. Should be called after any subtask update and must be used inside a transaction.
 */
export const syncParentTask = async ({
  tx,
  taskId,
  userId,
}: {
  tx: Prisma.TransactionClient;
  taskId: string;
  userId: string;
}) => {
  // 1. Fetch task + subtasks ONCE
  const task = await tx.task.findUnique({
    where: { id: taskId, userId },
    include: { subtasks: true },
  });

  if (!task) {
    throw new APIError({
      message: "Task not found",
      statusCode: 404,
      code: "TASK_NOT_FOUND",
    });
  }

  const subtasks = task.subtasks;

  // 2. No subtasks → do nothing
  if (subtasks.length === 0) return;

  const statuses = subtasks.map((s) => s.status);

  let targetStatus: Status | null = null;

  // 3. Decision logic

  const allShipped = statuses.every((s) => s === "SHIPPED");
  const anyInProgress = statuses.some((s) => s === "IN_PROGRESS");
  const allBlocked = statuses.every((s) => s === "BLOCKED");

  if (allShipped) {
    targetStatus = "IN_REVIEW";
  } else if (anyInProgress) {
    targetStatus = "IN_PROGRESS";
  } else if (allBlocked) {
    targetStatus = "BLOCKED";
  }

  // 4. No change
  if (!targetStatus || targetStatus === task.status) return;

  // 5. IMPORTANT: use executor, not direct update
  await executeTaskTransition({
    taskId,
    userId,
    newStatus: targetStatus,
  });
};
/**
 * @description Executes a subtask status transition with validation. This is a simplified version without guard checks for demonstration purposes, but can be extended similarly to tasks if needed.
 * Must be used for any subtask status update to ensure consistency and proper syncing with parent task.
 */
export const executeSubTaskTransition = async ({
  subtaskId,
  userId,
  newStatus,
  blockedReason,
}: {
  subtaskId: string;
  userId: string;
  newStatus: TaskStatus;
  blockedReason?: string;
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch subtask
    const existing = await tx.subtask.findUnique({
      where: {
        id: subtaskId,
        task: {
          userId,
        },
      },
    });

    if (!existing) {
      throw new APIError({
        message: "Subtask not found",
        statusCode: 404,
        code: "SUBTASK_NOT_FOUND",
      });
    }

    const nextStatus = newStatus ?? existing.status;

    // 2. Same status → no-op
    if (existing.status === nextStatus) {
      return existing;
    }

    // 3. Terminal state protection
    if (existing.status === "SHIPPED") {
      throw new APIError({
        message: "Completed subtasks cannot be modified",
        statusCode: 400,
        code: "SUBTASK_ALREADY_COMPLETED",
      });
    }

    // 4. Transition validation
    const { allowed, reason } = canTransition({
      fromStatus: existing.status,
      toStatus: nextStatus,
    });

    if (!allowed) {
      throw new APIError({
        message: reason || "Invalid status transition",
        statusCode: 400,
        code: "INVALID_STATUS_TRANSITION",
      });
    }

    // 5. Blocked reason enforcement
    if (nextStatus === "BLOCKED" && !blockedReason) {
      throw new APIError({
        message: "Blocked subtasks require a reason",
        statusCode: 400,
        code: "BLOCKED_REASON_REQUIRED",
      });
    }

    // 6. Side effects
    const now = new Date();

    let startedAt = existing.startedAt;
    let shippedAt = existing.shippedAt;
    let lastActiveAt = existing.lastActiveAt;

    if (nextStatus === "IN_PROGRESS" && !startedAt) {
      startedAt = now;
    }

    if (["IN_PROGRESS", "IN_REVIEW"].includes(nextStatus)) {
      lastActiveAt = now;
    }

    if (nextStatus === "SHIPPED" && !shippedAt) {
      shippedAt = now;
    }

    const updateData = {
      status: nextStatus,
      updatedAt: now,
      startedAt,
      shippedAt,
      lastActiveAt,
      blockedReason: nextStatus === "BLOCKED" ? blockedReason : null,
    };

    // 7. Update subtask
    const updated = await tx.subtask.update({
      where: {
        id: subtaskId,
        task: {
          userId: userId,
        },
      },
      data: updateData,
    });

    // 8. Sync parent task (VERY IMPORTANT)
    await syncParentTask({
      tx,
      taskId: existing.taskId,
      userId,
    });

    return updated;
  });
};
