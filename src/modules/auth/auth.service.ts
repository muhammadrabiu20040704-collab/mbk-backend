import { User } from "../users/user.model.js";
import { RegisterInput, LoginInput } from "./auth.types.js";
import { AppError } from "../../utils/app-error.js";
import bcrypt from "bcrypt";
import { normalizePhoneNumber } from "../../shared/phone/phone.util.js";
import { jwtService } from "../../shared/jwt/jwt.service.js";
import crypto from "node:crypto";
import { Session } from "./session.model.js";

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
}
export const authService = new AuthService();
