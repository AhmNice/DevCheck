import prisma from "../config/database.js";
import { Prisma } from "../generated/prisma/client.js";
import { Status } from "../types/status.type.js";

const ACTIVE_STATUSES: readonly Status[] = ["IN_PROGRESS", "IN_REVIEW"];
type PrismaTx = Prisma.TransactionClient;

export const checkStatusTransitionGuards = async ({
  taskId,
  fromStatus,
  toStatus,
  userId,
  tx = prisma as any,
}: {
  taskId: string;
  fromStatus: Status;
  toStatus: Status;
  userId: string;
  tx?: PrismaTx;
}): Promise<{ allowed: boolean; reason: string | null }> => {
  if (fromStatus === toStatus) {
    return { allowed: true, reason: null };
  }

  const isMovingToActive = ACTIVE_STATUSES.includes(toStatus);

  if (isMovingToActive) {
    const [settings, activeCount] = await Promise.all([
      tx.userSettings.findUnique({
        where: { userId },
        select: { maxActiveTasks: true },
      }),
      tx.task.count({
        where: {
          userId,
          status: { in: ACTIVE_STATUSES as Status[] },
          NOT: { id: taskId },
        },
      }),
    ]);

    const maxAllowed = settings?.maxActiveTasks ?? 2;

    if (activeCount >= maxAllowed) {
      return {
        allowed: false,
        reason: `WIP limit reached. You have ${activeCount}/${maxAllowed} active tasks. Complete or block one before moving this task to ${toStatus}.`,
      };
    }
  }

  return {
    allowed: true,
    reason: null,
  };
};
