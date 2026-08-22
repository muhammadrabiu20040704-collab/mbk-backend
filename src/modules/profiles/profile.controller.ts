import type { Request, Response } from "express";
import { profileService } from "./profile.service.js";
import { AppError } from "../../utils/app-error.js";
import { updateProfileSchema } from "./profile.validation.js";

export class ProfileController {
  async getMyProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const profile = await profileService.getMyProfile(req.user.sub);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  async getPublicProfile(req: Request, res: Response): Promise<void> {
    const { username } = req.params;

    if (typeof username !== "string") {
      throw new AppError("Invalid username", 400);
    }

    const profile = await profileService.getPublicProfile(username);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  async updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    const input = updateProfileSchema.parse(req.body);

    const profile = await profileService.updateProfile(req.user.sub, input);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }
}

export const profileController = new ProfileController();
