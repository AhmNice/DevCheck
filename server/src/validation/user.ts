import { z } from "zod";

/**
 * userUpdateSchema
 * Allows partial updates, but ensures at least one field is provided.
 */
export const userUpdateSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .optional(),
      bio: z
        .string()
        .trim()
        .max(160, "Bio cannot exceed 160 characters")
        .optional(),
      profile_picture: z
        .string()
        .trim()
        .url("Invalid profile picture URL")
        .optional(),
      job_role: z.string().trim().min(2).max(100).optional(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
      email: z.string().trim().email("Invalid email address").optional(),
    })
    .refine(
      (data) =>
        Object.values(data).some(
          (value) => value !== undefined && value !== "",
        ),
      {
        message: "At least one field must be provided for update",
      },
    ),
});

/**
 * createUserSchema
 * Standard registration validation.
 */
export const createUserSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().trim().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    account_role: z.enum(["user", "admin"]).optional(),
  }),
});

/**
 * userVerificationSchema
 * Validates both the request body (OTP) and query parameters (Purpose).
 */
export const userVerificationSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Invalid email address"),
    otp: z.string().trim().length(6, "OTP must be 6 characters"),
  }),
  query: z.object({
    purpose: z.string().trim().min(2, "Purpose must be at least 2 characters"),
  }),
});
