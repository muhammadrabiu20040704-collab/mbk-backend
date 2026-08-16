import { Request, Response } from "express";
import { AppError } from "../../utils/app-error.js";
import { authService } from "./auth.service.js";
import { ForgotPasswordInput } from "./auth.types.js";

type ChangePasswordInput = Parameters<typeof authService.changePassword>[1];

class AuthController {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: result,
    });
  }

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, {
      ipAddress: req.ip ?? "unknown",
      userAgent: req.get("user-agent") ?? "unknown",
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const result = await authService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      data: result,
    });
  }

  async me(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      message: "Authenticated user",
      data: req.user,
    });
  }

  async logout(req: Request, res: Response) {
    await authService.logout(req.body.refreshToken);
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  }

  async logoutAll(req: Request, res: Response) {
    const result = await authService.logoutAll(req.body.refreshToken);

    res.status(200).json({
      success: true,
      message: "Logged out from all devices",
      data: result,
    });
  }
  async getSessions(req: Request, res: Response) {
    const sessions = await authService.getSessions(req.user!.sub);

    res.status(200).json({
      success: true,
      message: "Sessions retrieved successfully",
      data: sessions,
    });
  }

  async revokeSession(req: Request, res: Response) {
    const { sessionId } = req.params;

    if (typeof sessionId !== "string") {
      throw new AppError("Invalid session ID", 400);
    }

    await authService.revokeSession(sessionId, req.user!.sub);

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
    });
  }

  async changePassword(req: Request, res: Response) {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const data = req.body as ChangePasswordInput;

    await authService.changePassword(req.user.sub, data);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }

  async forgotPassword(req: Request, res: Response) {
    const { identifier, channel } = req.body as ForgotPasswordInput;

    await authService.forgotPassword(identifier, channel);

    return res.status(200).json({
      success: true,
      message: "If the account exists, a password reset OTP has been sent.",
    });
  }

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(req.body);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
      data: result,
    });
  }

  async verifyResetOTP(req: Request, res: Response) {
    const result = await authService.verifyResetOTP(req.body);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: result,
    });
  }
}

export const authController = new AuthController();
