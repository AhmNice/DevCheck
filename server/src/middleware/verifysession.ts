import { Session } from "../service/Session.service.js";
import { Request, Response, NextFunction } from "express";
export const verifySession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = {
      user_id: "",
      userName: "",
      email: "",
      role: "",
    };

    const session = new Session(payload);
    await session.verifySession(req, res, next);
  } catch (error) {
    next(error);
  }
};
