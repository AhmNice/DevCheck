import { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = <
  ReqParams = Record<string, string>,
  ResBody = unknown,
  ReqBody = unknown,
  ReqQuery = Record<string, unknown>,
  Locals extends Record<string, string | number | boolean> = Record<
    string,
    string | number | boolean
  >,
>(
  fn: (
    req: Request<ReqParams, ResBody, ReqBody, ReqQuery>,
    res: Response<ResBody, Locals>,
    next: NextFunction,
  ) => Promise<unknown> | unknown,
): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res as Response<ResBody, Locals>, next)).catch(
      next,
    );
  };
};
