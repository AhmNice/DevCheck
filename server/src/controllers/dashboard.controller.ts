import { Request, Response } from "express";
import { asyncHandler } from "../utils/requestHandler.js";
import { pool } from "../config/db.config.js";
import { Task } from "../service/Task.service.js";

export const dashboardSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID not found in session",
      });
    }

    const [taskSummary, weeklySummary, currentWeekSummary] = await Promise.all([
      Task.summaryByUserId({ client: pool, user_id: userId }),
      Task.weeklySummaryByUserId({ client: pool, user_id: userId }),
      Task.currentWeekProgressByUserId({ client: pool, user_id: userId }),
    ]);

    return res.json({
      success: true,
      data: {
        taskSummary,
        weeklySummary,
        currentWeekSummary,
      },
    });
  },
);
