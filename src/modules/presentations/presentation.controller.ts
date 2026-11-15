import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { presentationService } from "./presentation.service.js";

function getCurrentUserId(req: Request): Types.ObjectId {
  const userId = req.user?.sub;

  if (!userId || !Types.ObjectId.isValid(userId)) {
    throw new AppError("Authentication required.", 401);
  }

  return new Types.ObjectId(userId);
}

export class PresentationController {
  async create(req: Request, res: Response) {
    const presenterId = getCurrentUserId(req);

    const presentation = await presentationService.create(presenterId, req.body, req.file);

    return res.status(201).json({
      success: true,
      message: "Presentation created successfully.",
      data: presentation,
    });
  }

  async getById(req: Request, res: Response) {
    const presentationId = req.params.presentationId;

    if (typeof presentationId !== "string" || !presentationId) {
      throw new AppError("A valid presentation ID is required.", 400);
    }

    const presentation = await presentationService.findById(presentationId);

    return res.status(200).json({
      success: true,
      message: "Presentation retrieved successfully.",
      data: presentation,
    });
  }

  async getMyPresentations(req: Request, res: Response) {
    const presenterId = getCurrentUserId(req);

    const presentations = await presentationService.findByPresenter(presenterId.toString());

    return res.status(200).json({
      success: true,
      message: "Your presentations retrieved successfully.",
      data: presentations,
    });
  }

  async update(req: Request, res: Response) {
    const presenterId = getCurrentUserId(req);
    const presentationId = req.params.presentationId;

    if (typeof presentationId !== "string" || !presentationId) {
      throw new AppError("A valid presentation ID is required", 400);
    }

    const presentation = await presentationService.update(
      presenterId,
      presentationId,
      req.body,
      req.file,
    );
    return res.status(200).json({
      success: true,
      message: "Presentation updated successfully.",
      data: presentation,
    });
  }
}

export const presentationController = new PresentationController();
