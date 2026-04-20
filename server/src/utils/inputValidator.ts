import { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { BadRequestError } from "./errorHandler.js";

export const validateRegisterInput = [
  body("name").notEmpty().withMessage("Name is required").escape(),
  body("email").isEmail().withMessage("Invalid email address").escape(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .escape(),
  body("account_role")
    .isIn(["user", "admin"])
    .withMessage("Invalid account role")
    .escape(),
];
export const validateLoginInput = [
  body("email").isEmail().withMessage("Invalid email address").escape(),
  body("password").notEmpty().withMessage("Password is required").escape(),
];
export const validateOTPInput = [
  body("email").isEmail().withMessage("Invalid email address").escape(),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .escape(),
  query("purpose")
    .isIn(["verification", "password_reset"])
    .withMessage("Invalid purpose for OTP verification")
    .escape(),
];
export const validateTaskInput = [
  body("title").notEmpty().withMessage("Title is required").escape(),
  body("description").optional().escape(),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date format")
    .escape(),
  body("status")
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status value")
    .escape(),
  body("priority")
    .isIn(["normal", "medium", "high"])
    .withMessage("Invalid priority value")
    .escape(),
];
export const validateSubtaskInput = [
  body("title").notEmpty().withMessage("Title is required").escape(),
  body("description").optional().escape(),
  body("due_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid due date format")
    .escape(),
  body("status")
    .isIn(["pending", "in_progress", "completed"])
    .withMessage("Invalid status value")
    .escape(),
];
export const validateProjectInput = [
  body("name").notEmpty().withMessage("Name is required").escape(),
  body("description").optional().escape(),
  body("deadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid deadline format")
    .escape(),
];
export const validateId = (id_value: string) => {
  return [
    param(`${id_value}`)
      .isUUID()
      .withMessage("Invalid user ID format")
      .escape(),
  ];
};
export const validationResultHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError({
      message: errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    });
  }
  next();
};
