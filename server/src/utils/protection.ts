import { NextFunction, Request, Response } from "express";
import config from "../config/config.js";
import { UnauthorizedError } from "./errorHandler.js";
// import UserInterface from "../interface/user.interface.js";
import jwt from "jsonwebtoken";
import { SessionPayload } from "../interface/session.interface.js";

type Role = "USER" | "ADMIN";

export const protectedRoute = (requiredRoles: Role | Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sessionToken = req.cookies[config.SESSION_COOKIE_NAME_ACCESS];

      if (!sessionToken) {
        throw new UnauthorizedError({ message: "No session token provided" });
      }

      const decoded = jwt.verify(
        sessionToken,
        config.JWT_SECRET as string,
      ) as SessionPayload;

      // Normalize to array
      const roles = Array.isArray(requiredRoles)
        ? requiredRoles
        : [requiredRoles];
      if (!roles.includes(decoded.role as Role)) {
        throw new UnauthorizedError({
          message: "Insufficient permissions to access this resource",
        });
      }

      (req as Request).user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };
};
