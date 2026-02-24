import jwt from "jsonwebtoken";
import { Request, NextFunction, Response } from "express";
import { UnauthorizedError } from "./errorHandler.js";
import { SessionPayload } from "../interface/session.interface.js";
import config from "../config/config.js";

declare module "express-serve-static-core" {
  interface Request {
    user?: SessionPayload;
  }
}

export const createSession = (
  userInfo: SessionPayload,
  res: Response,
): void => {
  const token = jwt.sign(userInfo, config.JWT_SECRET as string, {
    expiresIn: config.JWT_EXPIRES_IN || "7d",
  });

  res.cookie(`${config.SESSION_COOKIE_NAME}`, token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const verifySession = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies[`${config.SESSION_COOKIE_NAME}`];
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
  } catch {
    throw new UnauthorizedError("Invalid session token");
  }
};
