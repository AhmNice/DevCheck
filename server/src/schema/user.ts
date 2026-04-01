import { z } from "zod";

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
      profile_picture: z.string().url("Invalid profile picture URL").optional(),
      job_role: z.string().trim().min(2).max(100).optional(),
      password: z
        .string()
        .min(6, "Password must be at least 6 characters")
        .optional(),
      email: z.string().email("Invalid email address").optional(),
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
    name: z.string().trim().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    account_role: z.enum(["user", "admin"]).optional(),
  }),
});
