import { z } from "zod";
import { normalizePhoneNumber } from "../../shared/phone/phone.util.js";
import { SUPPORTED_COUNTRIES } from "../../shared/phone/phone.constants.js";

// Register
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Full name must be at least 3 characters long" })
      .max(60, { message: "Full name must be at most 60 characters long" }),

    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, { message: "Username must be at least 3 characters long" })
      .max(30, { message: "Username must not exceed 30 characters long" })
      .regex(/^[a-z][a-z0-9_]*$/, {
        message:
          "Username must start with a letter and contain only lowercase letters, numbers, and underscores.",
      }),

    country: z.enum(SUPPORTED_COUNTRIES),

    phoneNumber: z.string().trim().min(1, {
      message: "Phone number is required.",
    }),

    password: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long.",
      })
      .max(100, {
        message: "Password must not exceed 100 characters.",
      }),
  })
  .superRefine((data, ctx) => {
    try {
      normalizePhoneNumber(data.phoneNumber, data.country);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phoneNumber"],
        message: "Invalid phone number.",
      });
    }
  });
// Login
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, {
    message: "Username or phone number is required.",
  }),
  password: z
    .string()
    .trim()
    .min(8, {
      message: "Password must be at least 8 characters long.",
    })
    .max(100, {
      message: "Password must not exceed 100 characters.",
    }),
  deviceId: z.string().trim().min(1),
  deviceName: z.string().trim().min(1),
});

// Refresh Token
export const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required."),
});
// Forgot Password
export const forgotPasswordSchema = z.object({});

// Change Password
export const changePasswordSchema = z.object({});
