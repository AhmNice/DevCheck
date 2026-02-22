import { Request } from "express";
import { body, validationResult } from "express-validator";
import { BadRequestError } from "./errorHandler.js";

export const validateRegisterInput = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("account_role")
    .isIn(["user", "admin"])
    .withMessage("Invalid account role"),
];

export const validationResultHandler = (req: Request) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new BadRequestError(
      errors
        .array()
        .map((err) => err.msg)
        .join(", "),
    );
  }
};
