import type { Request, Response } from "express";
import { followService } from "./follow.service.js";
import { AppError } from "../../utils/app-error.js";

export class FollowController {
  async follow(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    await followService.follow(req.user.sub, req.params.userId as string);

    return res.status(200).json({
      success: true,
      message: "User followed successfully",
    });
  }

  async unfollow(req: Request, res: Response): Promise<Response> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    await followService.unfollow(req.user.sub, req.params.userId as string);

    return res.status(200).json({
      success: true,
      message: "User unfollowed successfully",
    });
  }

  async getFollowrs(req: Request, res: Response): Promise<Response> {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const result = await followService.getFollowers(req.params.username as string, limit, cursor);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }

  async getFollowing(req: Request, res: Response): Promise<Response> {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
    const result = await followService.getFollowing(req.params.username as string, limit, cursor);
    return res.status(200).json({
      success: true,
      data: result,
    });
  }
}

export const followController = new FollowController();
