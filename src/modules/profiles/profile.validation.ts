import { z } from "zod";

export const updateProfileSchema = z
  .object({
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, {
        message: "Username must be at least 3 characters long.",
      })
      .max(30, {
        message: "Username must not exceed 30 characters long.",
      })
      .regex(/^[a-z][a-z0-9_]*$/, {
        message:
          "Username must start with a letter and contain only lowercase letters, numbers, and underscores.",
      })
      .optional(),

    bio: z
      .string()
      .trim()
      .max(250, {
        message: "Bio must not exceed 250 characters.",
      })
      .optional(),

    school: z
      .string()
      .trim()
      .max(150, {
        message: "School must not exceed 150 characters.",
      })
      .optional(),

    department: z
      .string()
      .trim()
      .max(100, {
        message: "Department must not exceed 100 characters.",
      })
      .optional(),

    level: z
      .string()
      .trim()
      .max(30, {
        message: "Level must not exceed 30 characters.",
      })
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one profile field must be provided.",
  });
