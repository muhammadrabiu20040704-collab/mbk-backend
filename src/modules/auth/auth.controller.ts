import { Request, Response } from "express";
import { authService } from "./auth.service.js";

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
}

export const authController = new AuthController();
