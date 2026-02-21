// src/utils/ErrorHandler.ts
import { Request, Response } from "express";

export class APIError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500, name?: string) {
    super(message);
    this.statusCode = statusCode;
    if (name) this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
): void => {
  let status = 500;
  let message = "Internal Server Error";

  if (err instanceof APIError) {
    status = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(status).json({
    success: false,
    message,
  });
};
