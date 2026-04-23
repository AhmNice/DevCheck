import passport from "passport";
import { Request, Response, NextFunction } from "express";
import { BadRequestError } from "../utils/errorHandler.js";

export const connectGitHub = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) {
    throw new BadRequestError({ message: "User not authenticated" });
  }

  passport.authenticate("github", {
    session: false,
    scope: ["read:user", "user:email"],
    state: JSON.stringify({
      type: "connect",
      userId: req.user.user_id,
    }),
  })(req, res, next);
};
export const githubLogin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  passport.authenticate("github", {
    session: false,
    scope: ["read:user", "user:email"],
    state: JSON.stringify({
      type: "login",
    }),
  })(req, res, next);
};
