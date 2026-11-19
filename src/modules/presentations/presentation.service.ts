import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { presentationRepository } from "./presentation.repository.js";
import type {
  IPresentation,
  PresentationListFilters,
  UpdatePresentationInput,
} from "./presentation.types.js";
import {
  PresentationStatus,
  PresentationType,
  RecordingPreference,
  PresentationVisibility,
} from "./presentation.enums.js";
import { mediaService } from "../../shared/media/media.service.js";
import { MEDIA_FOLDERS } from "../../shared/media/media.constants.js";
import { validatePresentationCover } from "./presentation-cover.validation.js";
import type { UploadedMedia } from "../../shared/media/media.types.js";
import { connectionRepository } from "../network/connections/connection.repository.js";

export class PresentationService {
  async create(
    presenterId: Types.ObjectId,
    data: Partial<IPresentation>,
    coverFile?: Express.Multer.File,
  ) {
    if (!Types.ObjectId.isValid(presenterId)) {
      throw new AppError("Invalid presenter ID.", 400);
    }

    if (!data.title?.trim()) {
      throw new AppError("Presentation title is required.", 400);
    }

    if (!data.description?.trim()) {
      throw new AppError("Presentation description is required.", 400);
    }

    if (!data.category?.trim()) {
      throw new AppError("Presentation category is required.", 400);
    }

    if (!data.topic?.trim()) {
      throw new AppError("Presentation topic is required.", 400);
    }

    if (!data.presentationType) {
      throw new AppError("Presentation type is required.", 400);
    }

    if (!Object.values(PresentationType).includes(data.presentationType)) {
      throw new AppError("Invalid presentation type.", 400);
    }

    let scheduledAt: Date | undefined;

    if (data.presentationType === PresentationType.RECORDED && data.scheduledAt) {
      throw new AppError("Recorded presentations cannot have a scheduled live start time.", 400);
    }

    if (data.presentationType === PresentationType.LIVE && data.scheduledAt) {
      scheduledAt = new Date(data.scheduledAt);

      if (Number.isNaN(scheduledAt.getTime())) {
        throw new AppError("Invalid scheduled date.", 400);
      }

      if (scheduledAt.getTime() < Date.now()) {
        throw new AppError("Presentation cannot be scheduled in the past.", 400);
      }
    }

    const visibility = data.visibility ?? PresentationVisibility.PUBLIC;

    if (!Object.values(PresentationVisibility).includes(visibility)) {
      throw new AppError("Invalid presentation visibility.", 400);
    }

    const recordingPreference = data.recordingPreference ?? RecordingPreference.NONE;

    if (!Object.values(RecordingPreference).includes(recordingPreference)) {
      throw new AppError("Invalid recording preference.", 400);
    }

    const presentationData: Partial<IPresentation> = {
      presenterId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      topic: data.topic.trim(),
      presentationType: data.presentationType,
      visibility,
      status:
        data.presentationType === PresentationType.RECORDED
          ? PresentationStatus.PUBLISHED
          : scheduledAt
            ? PresentationStatus.SCHEDULED
            : PresentationStatus.DRAFT,
      recordingPreference:
        data.presentationType === PresentationType.RECORDED
          ? RecordingPreference.NONE
          : recordingPreference,
      ...(scheduledAt && { scheduledAt }),
    };

    let uploadedCover: UploadedMedia | undefined;

    if (coverFile) {
      uploadedCover = await this.uploadCoverImage(coverFile);

      presentationData.coverImage = uploadedCover;
    }

    try {
      return await presentationRepository.create(presentationData);
    } catch (error) {
      if (uploadedCover) {
        try {
          await mediaService.delete(uploadedCover.publicId, "image");
        } catch (cleanupError) {
          console.error("Failed to clean up orphaned presentation cover:", cleanupError);
        }
      }

      throw error;
    }
  }

  async findById(presentationId: string, viewerId: Types.ObjectId) {
    // 1. Validate IDs
    if (!Types.ObjectId.isValid(presentationId) || !Types.ObjectId.isValid(viewerId)) {
      throw new AppError("Invalid ID.", 400);
    }

    // 2. Find presentation
    const presentation = await presentationRepository.findById(new Types.ObjectId(presentationId));

    if (!presentation) {
      throw new AppError("Presentation not found.", 404);
    }

    // 3. Check presentation owner
    const isOwner = presentation.presenterId.equals(viewerId);

    if (isOwner) {
      return presentation;
    }

    // 4. Other users cannot view drafts or cancelled presentations
    if (
      presentation.status === PresentationStatus.DRAFT ||
      presentation.status === PresentationStatus.CANCELLED
    ) {
      throw new AppError("Presentation not found.", 404);
    }

    // 5. Private presentations are only visible to their owner
    if (presentation.visibility === PresentationVisibility.PRIVATE) {
      throw new AppError("Presentation not found.", 404);
    }

    // 6. Public presentations are visible to authenticated users
    if (presentation.visibility === PresentationVisibility.PUBLIC) {
      return presentation;
    }

    // 7. Check accepted connection for CONNECTIONS presentations
    if (presentation.visibility === PresentationVisibility.CONNECTIONS) {
      const isConnected = await connectionRepository.areUsersConnected(
        viewerId,
        presentation.presenterId,
      );

      if (isConnected) {
        return presentation;
      }
    }

    throw new AppError("Presentation not found.", 404);
  }

  async findByPresenter(presenterId: string) {
    if (!Types.ObjectId.isValid(presenterId)) {
      throw new AppError("Invalid presenter ID.", 400);
    }

    return presentationRepository.findByPresenter(new Types.ObjectId(presenterId));
  }

  async uploadCoverImage(file: Express.Multer.File): Promise<UploadedMedia> {
    await validatePresentationCover(file);

    return mediaService.upload(file.buffer, MEDIA_FOLDERS.PRESENTATION_MEDIA, "image");
  }

  async update(
    presenterId: Types.ObjectId,
    presentationId: string,
    data: UpdatePresentationInput,
    coverFile?: Express.Multer.File,
  ) {
    // 1. Validate IDs
    if (!Types.ObjectId.isValid(presenterId)) {
      throw new AppError("Invalid presenter ID.", 400);
    }

    if (!Types.ObjectId.isValid(presentationId)) {
      throw new AppError("Invalid presentation ID.", 400);
    }

    // 2. Find existing presentation
    const existing = await presentationRepository.findById(new Types.ObjectId(presentationId));

    if (!existing) {
      throw new AppError("Presentation not found.", 404);
    }

    // 3. Check ownership
    if (!existing.presenterId.equals(presenterId)) {
      throw new AppError("You are not allowed to update this presentation.", 403);
    }

    // 4. Prevent editing an already published live presentation
    if (
      existing.presentationType === PresentationType.LIVE &&
      existing.status === PresentationStatus.PUBLISHED
    ) {
      throw new AppError("Published live presentations cannot be edited.", 400);
    }

    // 5. Prepare only allowed fields
    const updates: UpdatePresentationInput = {};

    if (data.title !== undefined) {
      if (!data.title.trim()) {
        throw new AppError("Presentation title cannot be empty.", 400);
      }

      updates.title = data.title.trim();
    }

    if (data.description !== undefined) {
      if (!data.description.trim()) {
        throw new AppError("Presentation description cannot be empty.", 400);
      }

      updates.description = data.description.trim();
    }

    if (data.category !== undefined) {
      if (!data.category.trim()) {
        throw new AppError("Category cannot be empty.", 400);
      }

      updates.category = data.category.trim();
    }

    if (data.topic !== undefined) {
      if (!data.topic.trim()) {
        throw new AppError("Topic cannot be empty.", 400);
      }

      updates.topic = data.topic.trim();
    }

    if (data.visibility !== undefined) {
      if (!Object.values(PresentationVisibility).includes(data.visibility)) {
        throw new AppError("Invalid presentation visibility.", 400);
      }

      updates.visibility = data.visibility;
    }

    if (data.recordingPreference !== undefined) {
      if (!Object.values(RecordingPreference).includes(data.recordingPreference)) {
        throw new AppError("Invalid recording preference.", 400);
      }

      if (existing.presentationType === PresentationType.RECORDED) {
        throw new AppError(
          "Recording preference cannot be changed for recorded presentations.",
          400,
        );
      }

      updates.recordingPreference = data.recordingPreference;
    }

    if (data.scheduledAt !== undefined) {
      if (existing.presentationType === PresentationType.RECORDED) {
        throw new AppError("Recorded presentations cannot have a scheduled start time.", 400);
      }

      if (data.scheduledAt === null) {
        updates.scheduledAt = null;
        updates.status = PresentationStatus.DRAFT;
      } else {
        const scheduledAt = new Date(data.scheduledAt);

        if (Number.isNaN(scheduledAt.getTime())) {
          throw new AppError("Invalid scheduled date.", 400);
        }

        if (scheduledAt.getTime() <= Date.now()) {
          throw new AppError("Presentation cannot be scheduled in the past.", 400);
        }

        updates.scheduledAt = scheduledAt;
        updates.status = PresentationStatus.SCHEDULED;
      }
    }

    if (data.durationMinutes !== undefined) {
      if (
        !Number.isInteger(data.durationMinutes) ||
        data.durationMinutes < 1 ||
        data.durationMinutes > 1440
      ) {
        throw new AppError("Invalid presentation duration.", 400);
      }

      updates.durationMinutes = data.durationMinutes;
    }

    // 7. Reject empty update
    if (Object.keys(updates).length === 0 && !coverFile) {
      throw new AppError("No valid update data provided.", 400);
    }

    // 8. Upload replacement cover if supplied
    let uploadedCover: UploadedMedia | undefined;

    if (coverFile) {
      uploadedCover = await this.uploadCoverImage(coverFile);
      updates.coverImage = uploadedCover;
    }

    try {
      const updated = await presentationRepository.updateById(
        new Types.ObjectId(presentationId),
        updates,
      );

      if (!updated) {
        throw new AppError("Presentation not found.", 404);
      }

      // 9. Delete old Cloudinary cover after successful database update
      if (uploadedCover && existing.coverImage?.publicId) {
        try {
          await mediaService.delete(existing.coverImage.publicId, "image");
        } catch (cleanupError) {
          console.error("Failed to delete old presentation cover:", cleanupError);
        }
      }

      return updated;
    } catch (error) {
      // Clean up new upload if database update fails
      if (uploadedCover) {
        try {
          await mediaService.delete(uploadedCover.publicId, "image");
        } catch (cleanupError) {
          console.error("Failed to clean up new presentation cover:", cleanupError);
        }
      }

      throw error;
    }
  }

  async listPublic(filters: PresentationListFilters, page: number, limit: number) {
    const safePage = Number.isInteger(page) && page > 0 ? page : 1;

    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 10;

    const queryFilters: PresentationListFilters = {
      ...filters,
      visibility: PresentationVisibility.PUBLIC,
    };

    // Public listing must never expose drafts or cancelled presentations.
    if (filters.presentationType === PresentationType.LIVE) {
      queryFilters.status = PresentationStatus.SCHEDULED;
      queryFilters.scheduledAfter = new Date();
    } else {
      queryFilters.status = PresentationStatus.PUBLISHED;
    }

    return presentationRepository.findMany(queryFilters, safePage, safeLimit);
  }
}

export const presentationService = new PresentationService();
