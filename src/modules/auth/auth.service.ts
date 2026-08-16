import { User } from "../users/user.model.js";
import { RegisterInput, LoginInput } from "./auth.types.js";
import { AppError } from "../../utils/app-error.js";
import bcrypt from "bcrypt";
import { normalizePhoneNumber } from "../../shared/phone/phone.util.js";
import { jwtService } from "../../shared/jwt/jwt.service.js";
import crypto from "node:crypto";
import { Session } from "./session.model.js";
import { ChangePasswordInput, VerifyResetOTPInput } from "./auth.types.js";
import { PasswordResetOTP } from "./password-reset-otp.model.js";
import { ResetPasswordInput, PasswordResetChannel } from "./auth.types.js";
import { emailService } from "../../shared/email/email.service.js";

export class AuthService {
  async register(data: RegisterInput) {
    const { fullName, username, password, country } = data;

    const normalizedPhoneNumber = normalizePhoneNumber(data.phoneNumber, data.country);

    const existingUserByPhone = await User.findOne({
      phoneNumber: normalizedPhoneNumber,
    });

    if (existingUserByPhone) {
      throw new AppError("Phone number already exists", 409);
    }

    const existingUserByUsername = await User.findOne({
      username,
    });

    if (existingUserByUsername) {
      throw new AppError("Username already exists", 409);
    }

    const user = new User({
      fullName,
      username,
      phoneNumber: normalizedPhoneNumber,
      password,
      country,
    });

    await user.save();

    return {
      id: user._id.toString(),
      fullName: user.fullName,
      username: user.username,
      phoneNumber: user.phoneNumber,
    };
  }

  async login(data: LoginInput, metadata: { ipAddress: string; userAgent: string }) {
    const { identifier, password, deviceId, deviceName } = data;
    const { ipAddress, userAgent } = metadata;

    let normalizedPhoneNumber: string | null;

    try {
      normalizedPhoneNumber = normalizePhoneNumber(identifier, "NG");
    } catch {
      normalizedPhoneNumber = null;
    }
    const user = normalizedPhoneNumber
      ? await User.findOne({
          phoneNumber: normalizedPhoneNumber,
        })
      : await User.findOne({
          username: identifier.toLowerCase(),
        });
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401);
    }
    const accessToken = jwtService.generateAccessToken({
      sub: user._id.toString(),
      username: user.username,
    });

    const refreshToken = jwtService.generateRefreshToken({
      sub: user._id.toString(),
      username: user.username,
    });

    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await Session.create({
      userId: user._id,
      tokenHash,
      deviceId,
      deviceName,
      ipAddress,
      userAgent,
      expiresAt,
    });
    return {
      user: {
        id: user._id.toString(),
        fullName: user.fullName,
        username: user.username,
        phoneNumber: user.phoneNumber,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = jwtService.verifyRefreshToken(refreshToken);

      const tokenHash = this.hashToken(refreshToken);

      const session = await Session.findOne({
        tokenHash,
      });

      if (!session) {
        throw new AppError("Invalid refresh token", 401);
      }

      if (session.revokedAt) {
        throw new AppError("Session has been revoked", 401);
      }

      if (session.expiresAt <= new Date()) {
        throw new AppError("Session has expired", 401);
      }

      if (session.userId.toString() !== payload.sub) {
        throw new AppError("Invalid session", 401);
      }

      const newAccessToken = jwtService.generateAccessToken({
        sub: payload.sub,
        username: payload.username,
      });

      const newRefreshToken = jwtService.generateRefreshToken({
        sub: payload.sub,
        username: payload.username,
      });

      const newTokenHash = this.hashToken(newRefreshToken);

      session.tokenHash = newTokenHash;

      await session.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }
  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const session = await Session.findOne({
      tokenHash,
    });

    if (!session) {
      throw new AppError("invalid refresh token", 401);
    }
    if (session.revokedAt) {
      throw new AppError("Session Already Revoked", 401);
    }

    session.revokedAt = new Date();

    await session.save();
  }

  async logoutAll(refreshToken: string) {
    try {
      const payload = jwtService.verifyRefreshToken(refreshToken);

      const result = await Session.updateMany(
        {
          userId: payload.sub,
          revokedAt: null,
        },
        {
          $set: {
            revokedAt: new Date(),
          },
        },
      );

      return {
        revokedSessions: result.modifiedCount,
      };
    } catch {
      throw new AppError("Invalid refresh token", 401);
    }
  }
  async getSessions(userId: string) {
    const sessions = await Session.find({
      userId,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    })
      .select("_id deviceId deviceName ipAddress userAgent createdAt expiresAt revokedAt")
      .sort({ createdAt: -1 });

    return sessions;
  }

  async revokeSession(sessionId: string, userId: string) {
    const session = await Session.findOne({
      _id: sessionId,
      userId,
      revokedAt: null,
    });

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    session.revokedAt = new Date();

    await session.save();
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const { currentPassword, newPassword } = data;

    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new AppError("New password must be different from current password", 400);
    }

    user.password = newPassword;

    await user.save();

    await Session.updateMany(
      {
        userId: user._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    return {
      message: "Password changed successfully",
    };
  }

  async forgotPassword(identifier: string, channel: PasswordResetChannel) {
    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier },
      ],
    });

    // Generic response for security.
    if (!user) {
      return;
    }

    // Remove previous unused OTPs.
    await PasswordResetOTP.deleteMany({
      userId: user._id,
      usedAt: null,
    });

    // Generate exactly 6 digits.
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // 3 minutes expiry.
    const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

    await PasswordResetOTP.create({
      userId: user._id,
      otpHash,
      channel,
      expiresAt,
    });

    if (channel === "email" && user.email) {
      await emailService.sendPasswordResetOTP({
        to: user.email,
        otp,
      });
    }

    // TODO:
    // Send OTP through SMS or Email.
    // Never return OTP in production.
  }

  async verifyResetOTP(data: VerifyResetOTPInput) {
    const { identifier, otp } = data;

    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier },
      ],
    });

    // Generic response for security
    if (!user) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const resetOTP = await PasswordResetOTP.findOne({
      userId: user._id,
      otpHash,
      usedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!resetOTP) {
      throw new AppError("Invalid or expired OTP", 400);
    }

    resetOTP.verifiedAt = new Date();

    await resetOTP.save();

    return {
      verified: true,
    };
  }

  async resetPassword(data: ResetPasswordInput) {
    const { identifier, newPassword } = data;

    const user = await User.findOne({
      $or: [
        { username: identifier.toLowerCase() },
        { email: identifier.toLowerCase() },
        { phoneNumber: identifier },
      ],
    }).select("+password");

    if (!user) {
      throw new AppError("Invalid or expired password reset request", 400);
    }

    if (!user.isActive) {
      throw new AppError("Account is inactive", 403);
    }

    const resetOTP = await PasswordResetOTP.findOne({
      userId: user._id,
      usedAt: null,
      verifiedAt: { $ne: null },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!resetOTP) {
      throw new AppError("OTP verification required or expired", 400);
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      throw new AppError("New password must be different from current password", 400);
    }

    // userSchema.pre("save") zai hash password.
    user.password = newPassword;

    await user.save();

    // OTP is now consumed.
    resetOTP.usedAt = new Date();
    await resetOTP.save();

    // Revoke all existing sessions.
    await Session.updateMany(
      {
        userId: user._id,
        revokedAt: null,
      },
      {
        $set: {
          revokedAt: new Date(),
        },
      },
    );

    return {
      message: "Password reset successfully",
    };
  }
}
export const authService = new AuthService();
