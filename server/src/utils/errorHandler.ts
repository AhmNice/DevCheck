import { Request, Response } from "express";
import config from "../config/config.js";
const isProduction = config.NODE_ENV === "production";
export class APIError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode = 500, name?: string) {
    super(message);
    this.statusCode = statusCode;
    if (name) this.name = name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends APIError {
  constructor(message = "Resource not found") {
    super(message, 404, "NotFoundError");
  }
}
export class BadRequestError extends APIError {
  constructor(message = "Bad request") {
    super(message, 400, "BadRequestError");
  }
}
export class UnauthorizedError extends APIError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UnauthorizedError");
  }
}
export class ForbiddenError extends APIError {
  constructor(message = "Forbidden") {
    super(message, 403, "ForbiddenError");
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
    message: isProduction && status === 500 ? "Something went wrong" : message,
  });
};
