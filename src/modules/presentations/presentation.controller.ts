import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { presentationService } from "./presentation.service.js";
import type { PresentationListFilters } from "./presentation.types.js";
import { PresentationType } from "./presentation.enums.js";

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
    // 1. Get the authenticated user ID
    const viewerId = getCurrentUserId(req);

    // 2. Get presentation ID
    const presentationId = req.params.presentationId;

    if (typeof presentationId !== "string" || !presentationId) {
      throw new AppError("A valid presentation ID is required.", 400);
    }

    // 3. Retrieve presentation with authorization
    const presentation = await presentationService.findById(presentationId, viewerId);

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

  async list(req: Request, res: Response) {
    const { page, limit, type, category, search } = req.query;

    // Validate query parameter types
    if (
      (page !== undefined && typeof page !== "string") ||
      (limit !== undefined && typeof limit !== "string") ||
      (type !== undefined && typeof type !== "string") ||
      (category !== undefined && typeof category !== "string") ||
      (search !== undefined && typeof search !== "string")
    ) {
      throw new AppError("Invalid query parameters.", 400);
    }

    const pageNumber = page === undefined ? 1 : Number(page);
    const limitNumber = limit === undefined ? 10 : Number(limit);

    if (
      !Number.isInteger(pageNumber) ||
      pageNumber < 1 ||
      !Number.isInteger(limitNumber) ||
      limitNumber < 1
    ) {
      throw new AppError("Page and limit must be positive integers.", 400);
    }

    if (type !== undefined && !Object.values(PresentationType).includes(type as PresentationType)) {
      throw new AppError("Invalid presentation type.", 400);
    }

    const filters: PresentationListFilters = {
      ...(type && { presentationType: type as PresentationType }),
      ...(category?.trim() && { category: category.trim() }),
      ...(search?.trim() && { search: search.trim() }),
    };

    const result = await presentationService.listPublic(filters, pageNumber, limitNumber);

    return res.status(200).json({
      success: true,
      message: "Presentations retrieved successfully.",
      data: result,
    });
  }
}

export const presentationController = new PresentationController();
