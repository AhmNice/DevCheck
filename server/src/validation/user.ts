import { z } from "zod";
import { sanitizeInput } from "./task_schema.js";

export const userUpdateSchema = z.object({
  body: z
    .object({
      name: z
        .preprocess(
          sanitizeInput,
          z.string().trim().min(2, "Name must be at least 2 characters"),
        )
        .optional(),
      bio: z
        .preprocess(
          sanitizeInput,
          z.string().trim().max(160, "Bio cannot exceed 160 characters"),
        )
        .optional(),
      profile_picture: z
        .preprocess(
          sanitizeInput,
          z.string().trim().url("Invalid profile picture URL"),
        )
        .optional(),
      job_role: z
        .preprocess(sanitizeInput, z.string().trim().min(2).max(100))
        .optional(),
      password: z
        .preprocess(
          sanitizeInput,
          z.string().min(6, "Password must be at least 6 characters"),
        )
        .optional(),
      email: z
        .preprocess(
          sanitizeInput,
          z.string().trim().email("Invalid email address"),
        )
        .optional(),
    })
    .refine(
      (data: unknown) =>
        Object.values(data as Record<string, unknown>).some(
          (value) => value !== undefined && value !== "",
        ),
      {
        message: "At least one field must be provided for update",
      },
    ),
});
export const createUserSchema = z.object({
  body: z.object({
    name: z.preprocess(
      sanitizeInput,
      z.string().trim().min(2, "Name must be at least 2 characters"),
    ),
    email: z.preprocess(
      sanitizeInput,
      z.string().trim().email("Invalid email address"),
    ),
    password: z.preprocess(
      sanitizeInput,
      z.string().min(6, "Password must be at least 6 characters"),
    ),
    account_role: z.enum(["user", "admin"]).optional(),
  }),
});
export const userVerificationSchema = z.object({
  body: z.object({
    email: z.preprocess(
      sanitizeInput,
      z.string().trim().email("Invalid email address"),
    ),
    otp: z.preprocess(
      sanitizeInput,
      z.string().trim().length(6, "OTP must be 6 characters"),
    ),
  }),
  query: z.object({
    purpose: z.preprocess(
      sanitizeInput,
      z.string().trim().min(2, "Purpose must be at least 2 characters"),
    ),
  }),
});
