import { pool } from "../config/db.config.js";
import { SECURITY_CONFIG } from "../constant/security.constants.js";
import { APIError } from "../utils/errorHandler.js";

export class AuthSecurityService {
  static async checkLock(userId: string) {
    const { rows } = await pool.query(
      `SELECT lock_until FROM core.users WHERE _id = $1`,
      [userId],
    );

    const lockUntil = rows[0]?.lock_until;

    if (lockUntil && new Date(lockUntil) > new Date()) {
      throw new APIError(
        "Account temporarily locked",
        429,
        "ACCOUNT_TEMPORARILY_LOCKED",
      );
    }
  }

  static async registerFailure(userId: string) {
    const { rows } = await pool.query(
      `UPDATE core.users
       SET failed_attempts = failed_attempts + 1
       WHERE _id = $1
       RETURNING failed_attempts`,
      [userId],
    );

    const attempts = rows[0].failed_attempts;

    // Lock if needed
    if (attempts >= SECURITY_CONFIG.MAX_ATTEMPTS) {
      const lockUntil = new Date(
        Date.now() + SECURITY_CONFIG.LOCK_DURATION_MINUTES * 60 * 1000,
      );

      await pool.query(
        `UPDATE core.users
         SET lock_until = $1
         WHERE _id = $2`,
        [lockUntil, userId],
      );
    }

    // Exponential delay
    const delay = Math.min(
      Math.pow(2, attempts),
      SECURITY_CONFIG.MAX_DELAY_SECONDS,
    );

    await new Promise((res) => setTimeout(res, delay * 1000));
  }

  static async reset(userId: string) {
    await pool.query(
      `UPDATE core.users
       SET failed_attempts = 0,
           lock_until = NULL
       WHERE _id = $1`,
      [userId],
    );
  }
}
