import { CountryCode } from "libphonenumber-js";

export interface RegisterInput {
  fullName: string;
  username: string;
  country: CountryCode;
  phoneNumber: string;
  password: string;
}

export interface LoginInput {
  identifier: string;
  password: string;
  deviceId: string;
  deviceName: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export type PasswordResetChannel = "sms" | "email";

export interface ForgotPasswordInput {
  identifier: string;
  channel: PasswordResetChannel;
}

export interface ResetPasswordInput {
  identifier: string;
  newPassword: string;
  confirmPassword: string;
}

export interface VerifyResetOTPInput {
  identifier: string;
  otp: string;
}
