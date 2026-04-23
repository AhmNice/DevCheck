import { NextFunction, Request, Response } from "express";
import config from "../config/config.js";
import multer from "multer";
import { Prisma } from "../generated/prisma/client.js";
import { ZodError } from "zod";
import { formatErrorMessage } from "./formatErrorMessage.js";

const isProduction = config.NODE_ENV === "production";

type APIErrorOptions = {
  message: string;
  statusCode?: number;
  errors?: unknown[];
  code?: string;
};

type ErrorOptionsWithoutStatus = Omit<APIErrorOptions, "statusCode">;

export class APIError extends Error {
  public statusCode: number;
  public errors: unknown[];
  public code?: string;

  constructor({
    message,
    statusCode = 500,
    errors = [],
    code,
  }: APIErrorOptions) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Specific Errors (Fully Object-Based)
 */

export class BadRequestError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 400,
    });
  }
}

export class UnauthorizedError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 401,
    });
  }
}

export class ForbiddenError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 403,
    });
  }
}

export class NotFoundError extends APIError {
  constructor(options: ErrorOptionsWithoutStatus) {
    super({
      ...options,
      statusCode: 404,
    });
  }
}

/**
 * Helpers
 */

const extractErrorMessage = (err: unknown): string => {
  return err instanceof Error ? err.message : "Unknown error";
};

/**
 * Global Error Handler
 */

const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: APIError;

  /**
   * Multer Errors
   */
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        error = new APIError({
          message: "File too large. Max is 5MB",
          statusCode: 422,
          code: "FILE_TOO_LARGE",
        });
        break;

      case "LIMIT_UNEXPECTED_FILE":
        error = new APIError({
          message: "Unexpected file field",
          statusCode: 422,
          code: "UNEXPECTED_FILE",
        });
        break;

      default:
        error = new APIError({
          message: err.message,
          statusCode: 400,
          code: "MULTER_ERROR",
        });
    }
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    /**
     * Prisma Errors (Important for real apps)
     */
    switch (err.code) {
      case "P2002":
        error = new BadRequestError({
          message: "Duplicate field value",
          errors: [err.meta],
          code: "DUPLICATE_FIELD",
        });
        break;

      case "P2025":
        error = new NotFoundError({
          message: "Record not found",
          code: "RECORD_NOT_FOUND",
        });
        break;

      default:
        error = new APIError({
          message: "Database error",
          statusCode: 500,
          errors: [err.message],
          code: "PRISMA_ERROR",
        });
    }
  } else if (err instanceof APIError) {
    /**
     * Already handled APIError
     */
    error = err;
  } else if (err instanceof ZodError) {
    const errors = (err as any).issues.map((err: any) => ({
      field: err.path.join("."),
      message: formatErrorMessage(err.message),
    }));
    error = new APIError({
      message: "Validation Error",
      statusCode: 422,
      errors,
      code: "VALIDATION_ERROR",
    });
  } else {
    /**
     * Unknown Errors
     */
    error = new APIError({
      message: extractErrorMessage(err),
      statusCode: 500,
      code: "INTERNAL_SERVER_ERROR",
    });
  }

  /**
   * Response Shape
   */
  const response = {
    message: error.message,
    statusCode: error.statusCode,
    errors: error.errors,
    code: error.code ?? null,
    ...(isProduction ? {} : { stack: error.stack }),
  };

  if (req.files) {
    // deleteUploadedFiles(req.files);
  }

  return res.status(error.statusCode).json(response);
};

export { globalErrorHandler };
