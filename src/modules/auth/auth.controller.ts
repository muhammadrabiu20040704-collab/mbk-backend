import { Request, Response } from "express";
import { authService } from "./auth.service.js";
import { success } from "zod";

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
}
export const authController = new AuthController();
