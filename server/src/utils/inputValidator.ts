import { NextFunction, Request, Response } from "express";
import { body, query, validationResult } from "express-validator";
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

export const validationResultHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(
      errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    );
  }
  next();
};
