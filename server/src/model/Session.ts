import config from "../config/config.js";
import jwt from "jsonwebtoken";
import { SessionPayload } from "../interface/session.interface.js";
import { Response, Request, NextFunction } from "express";
import { UnauthorizedError } from "../utils/errorHandler.js";
import { pool } from "../config/db.config.js";
import bcrypt from "bcrypt";
import { User } from "./User.js";

interface StoredRefreshToken {
  refreshToken: string;
  user_id: string;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionPayload;
  }
}

export class Session {
  constructor(private payload: SessionPayload) {
    Object.assign(this.payload);
  }
  private refreshToken: string = "";
  async saveSession(user_id: string) {
    try {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const hashedToken = await bcrypt.hash(this.refreshToken, 10);
      const result = await pool.query(
        `INSERT INTO session.tokens(user_id, refresh_token, expires_at) VALUES ($1, $2, $3) RETURNING *`,
        [user_id, hashedToken, expiresAt],
      );
      if (!result.rowCount) {
        throw new Error("Failed to save session token");
      }
    } catch (error) {
      throw new Error(
        "Error saving session token: " + (error as Error).message,
      );
    }
  }
  async getSessionRefreshToken({
    token,
    user_id,
  }: {
    token: string;
    user_id: string;
  }): Promise<StoredRefreshToken | null> {
    try {
      const result = await pool.query(
        `SELECT refresh_token, user_id FROM session.tokens WHERE expires_at > NOW() AND user_id = $1`,
        [user_id],
      );
      if (!result.rows.length) return null;

      for (const row of result.rows) {
        const isMatch = await bcrypt.compare(token, row.refresh_token);
        if (isMatch)
          return { refreshToken: row.refresh_token, user_id: row.user_id };
      }
      return null;
    } catch (error) {
      throw new Error(
        "Error retrieving session token: " + (error as Error).message,
      );
    }
  }
  async createSession(res: Response): Promise<void> {
    const accessToken = jwt.sign(this.payload, config.JWT_SECRET as string, {
      expiresIn: config.JWT_EXPIRES_IN || "15m",
    });
    const refreshToken = jwt.sign(this.payload, config.JWT_SECRET as string, {
      expiresIn: "7d",
    });
    this.refreshToken = refreshToken;
    await this.saveSession(this.payload.user_id);

    res.cookie(config.SESSION_COOKIE_NAME_REFRESH, refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.cookie(`${config.SESSION_COOKIE_NAME_ACCESS}`, accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
    });
  }
  async verifySession(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies[`${config.SESSION_COOKIE_NAME_ACCESS}`];
    if (!token) {
      throw new UnauthorizedError("No session token provided");
    }
    try {
      const decoded = jwt.verify(
        token,
        config.JWT_SECRET as string,
      ) as SessionPayload;
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        const refreshToken =
          req.cookies[`${config.SESSION_COOKIE_NAME_REFRESH}`];
        if (!refreshToken) {
          throw new UnauthorizedError("No refresh token provided");
        }
        let decodedRefresh: SessionPayload;
        try {
          decodedRefresh = jwt.verify(
            refreshToken,
            config.JWT_SECRET as string,
          ) as SessionPayload;
        } catch {
          throw new UnauthorizedError("Invalid refresh token");
        }
        req.user = decodedRefresh;
        const storedRefreshToken = await this.getSessionRefreshToken({
          token: refreshToken,
          user_id: req.user.user_id,
        });
        if (!storedRefreshToken || !storedRefreshToken.refreshToken) {
          throw new UnauthorizedError("Invalid refresh token");
        }

        const user = await User.findById(`${storedRefreshToken.user_id}`);
        if (!user) {
          throw new UnauthorizedError("User not found");
        }
        await pool.query(
          `DELETE FROM session.tokens WHERE user_id = $1 AND refresh_token = $2`,
          [user._id, storedRefreshToken.refreshToken],
        );
        const userInfo: SessionPayload = {
          user_id: user._id,
          userName: user.name,
          email: user.email,
          role: user.account_role,
        };
        const newAccessToken = jwt.sign(userInfo, config.JWT_SECRET as string, {
          expiresIn: config.JWT_EXPIRES_IN || "15m",
        });
        const newRefreshToken = jwt.sign(
          userInfo,
          config.JWT_SECRET as string,
          {
            expiresIn: "7d",
          },
        );
        this.refreshToken = newRefreshToken;
        await this.saveSession(user._id);
        res.cookie(`${config.SESSION_COOKIE_NAME_REFRESH}`, newRefreshToken, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite: "strict",
        });
        res.cookie(`${config.SESSION_COOKIE_NAME_ACCESS}`, newAccessToken, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite: "strict",
        });
        next();
      } else {
        throw new UnauthorizedError("Invalid session token");
      }
    }
  }
  private async deleteSession(refreshToken: string): Promise<void> {
    try {
      await pool.query(`DELETE FROM session.tokens WHERE refresh_token = $1`, [
        refreshToken,
      ]);
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  }
  async destroySession(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies[`${config.SESSION_COOKIE_NAME_REFRESH}`];
    if (refreshToken) {
      const query = `SELECT refresh_token FROM session.tokens WHERE user_id = $1`;
      const result = await pool.query(query, [req.user?.user_id]);
      if (result.rowCount) {
        for (const row of result.rows) {
          const isMatch = await bcrypt.compare(refreshToken, row.refresh_token);
          if (isMatch) {
            await this.deleteSession(row.refresh_token);
            break;
          }
        }
      }
    }
    res.clearCookie(`${config.SESSION_COOKIE_NAME_ACCESS}`);
    res.clearCookie(`${config.SESSION_COOKIE_NAME_REFRESH}`);
  }
}
