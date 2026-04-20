import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { APIError } from "../utils/errorHandler.js";
export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        files: req.files,
        file: req.file,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      console.error("Validation error:", error);
      if (error instanceof ZodError) {
        const errors = (error as any).issues.map((err: any) => ({
          field: err.path.join("."),
          message: err.message,
        }));
        next(
          new APIError({
            statusCode: 422,
            message: "Validation Error",
            errors,
            code: "VALIDATION_ERROR",
          }),
        );
      } else {
        next(error);
      }
    }
  };
};
