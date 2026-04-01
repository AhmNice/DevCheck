import { NextFunction, Request, Response } from "express";
import { ParsedQs } from "qs";
import { ZodSchema } from "zod";

export const validateRequest =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (!result.success) {
      const errors = result.error.flatten();
      return res.status(400).json({
        message: "Validation failed",
        errors,
      });
    }
    const data = result.data as {
      body: unknown;
      query: unknown;
      params: unknown;
    };
    req.body = data.body;
    req.query = data.query as ParsedQs;
    req.params = data.params as Record<string, string>;
    next();
  };
