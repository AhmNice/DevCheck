import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../model/User.js";
import { BadRequestError } from "../utils/errorHandler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, account_role } = req.body;

  if (await User.exists(email)) {
    throw new BadRequestError("User with this email already exists");
  }

  const user = new User({ name, email, password, account_role });
  const savedUser = await user.save();

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    user: savedUser,
  });
});
