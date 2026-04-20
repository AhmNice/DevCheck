import { Status } from "../types/status.type.js";
import { APIError } from "../utils/errorHandler.js";

export const allowedTransitions: Record<Status, readonly Status[]> = {
  BACKLOG: ["PLANNED"],
  PLANNED: ["IN_PROGRESS"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED", "COMPLETED"],
  BLOCKED: ["IN_PROGRESS"],
  IN_REVIEW: ["SHIPPED", "IN_PROGRESS"],
  COMPLETED: ["IN_PROGRESS", "SHIPPED"],
  SHIPPED: [],
};
interface response {
  allowed: boolean;
  reason: string;
}
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
