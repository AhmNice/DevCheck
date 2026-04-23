import { SECURITY_CONFIG } from "../constant/security.constants.js";
import { APIError } from "../utils/errorHandler.js";
import prisma from "../config/database.js";

export class AuthSecurityService {
  static async checkLock(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lockUntil: true },
    });

    const lockUntil = user?.lockUntil;

    if (lockUntil && new Date(lockUntil) > new Date()) {
      throw new APIError({
        message: "Account temporarily locked",
        statusCode: 429,
        errors: [],
        code: "ACCOUNT_TEMPORARILY_LOCKED",
      });
    }
  }

  static async registerFailure(userId: string) {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: {
          increment: 1,
        },
      },
      select: { failedAttempts: true },
    });

    const attempts = updatedUser.failedAttempts;

    // Lock if needed
    if (attempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
      const lockUntil = new Date(
        Date.now() + SECURITY_CONFIG.LOCK_DURATION_MINUTES * 60 * 1000,
      );

      await prisma.user.update({
        where: { id: userId },
        data: { lockUntil },
      });
    }

    // Exponential delay
    const delay = Math.min(
      Math.pow(2, attempts),
      SECURITY_CONFIG.MAX_DELAY_SECONDS,
    );

    await new Promise((res) => setTimeout(res, delay * 1000));
  }

  static async reset(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        failedAttempts: 0,
        lockUntil: null,
      },
    });
  }
}
