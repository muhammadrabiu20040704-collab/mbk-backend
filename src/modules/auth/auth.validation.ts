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
export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(1, {
    message: "Username, email or phone number is required.",
  }),

  channel: z.enum(["sms", "email"], {
    message: "Channel must be sms or email.",
  }),
});

// Change Password
export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .trim()
      .min(8, {
        message: "Current password must be at least 8 characters long.",
      })
      .max(100, {
        message: "Current password must not exceed 100 characters.",
      }),

    newPassword: z
      .string()
      .trim()
      .min(8, {
        message: "New password must be at least 8 characters long.",
      })
      .max(100, {
        message: "New password must not exceed 100 characters.",
      }),

    confirmPassword: z
      .string()
      .trim()
      .min(8, {
        message: "Password confirmation must be at least 8 characters long.",
      })
      .max(100, {
        message: "Password confirmation must not exceed 100 characters.",
      }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "New password and confirmation do not match.",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "New password must be different from current password.",
  });

export const resetPasswordSchema = z
  .object({
    identifier: z.string().trim().min(1, {
      message: "Username, email or phone number is required.",
    }),

    newPassword: z
      .string()
      .min(8, {
        message: "Password must be at least 8 characters long.",
      })
      .max(100, {
        message: "Password must not exceed 100 characters.",
      }),

    confirmPassword: z.string().min(1, {
      message: "Confirm password is required.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

export const verifyResetOTPSchema = z.object({
  identifier: z.string().trim().min(1, {
    message: "Username, email or phone number is required.",
  }),

  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, {
      message: "OTP must be exactly 6 digits.",
    }),
});
