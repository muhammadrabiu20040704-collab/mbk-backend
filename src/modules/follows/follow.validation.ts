import { z } from "zod";

export const followUserSchema = z.object({
  userId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, {
      message: "Invalid user ID.",
    }),
});
