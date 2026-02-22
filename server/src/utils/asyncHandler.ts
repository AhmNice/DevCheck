import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery = Record<string, unknown>,
  Locals extends Record<string, string | number | boolean> = Record<
    string,
    string | number | boolean
  >,
>(
  fn: (
    req: Request<ReqQuery, ResBody, ReqBody, Locals>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<void>,
): RequestHandler<ReqQuery, ResBody, ReqBody, Locals> => {
  return (req, res, next) => {
    fn(req, res as Response<ResBody, Locals>, next).catch(next);
  };
};
