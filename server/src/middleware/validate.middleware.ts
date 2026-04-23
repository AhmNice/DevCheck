import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { APIError } from "../utils/errorHandler.js";
import sanitizeHtml from "sanitize-html";
import validator from "validator";
import { formatErrorMessage } from "../utils/formatErrorMessage.js";
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
      console.log(req.body.due_date);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = (error as any).issues.map((err: any) => ({
          field: err.path.join("."),
          message: formatErrorMessage(err.message),
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

export const sanitizeBodyMiddleware = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (req.body) {
    Object.keys(req.body).forEach((key) => {
      let value = req.body[key];

      if (typeof value === "string") {
        value = sanitizeHtml(value.trim(), {
          allowedTags: [],
          allowedAttributes: {},
          disallowedTagsMode: "discard",
        });

        // Check if it's an ISO date format
        const isISODate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(
          value,
        );

        if (value.includes(":") && !isISODate) {
          const _isUrl = validator.isURL(value, { require_protocol: true });
          const isSafeProtocol = /^(https?|mailto|tel):/i.test(value);

          if (!isSafeProtocol) {
            console.warn(
              `Blocked suspicious protocol in field ${key}: ${value}`,
            );
            value = "";
          }
        }

        req.body[key] = value;
      }
    });
  }
  next();
};
