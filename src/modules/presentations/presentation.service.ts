import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { presentationRepository } from "./presentation.repository.js";
import type { IPresentation } from "./presentation.types.js";
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

    if (
      data.presentationType === PresentationType.LIVE &&
      data.scheduledAt &&
      new Date(data.scheduledAt).getTime() < Date.now()
    ) {
      throw new AppError("Presentation cannot be scheduled in the past.", 400);
    }

    if (data.presentationType === PresentationType.RECORDED && data.scheduledAt) {
      throw new AppError("Recorded presentations cannot have a scheduled live start time.", 400);
    }

    const presentationData: Partial<IPresentation> = {
      ...data,
      presenterId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category.trim(),
      topic: data.topic.trim(),
      status:
        data.presentationType === PresentationType.RECORDED
          ? PresentationStatus.PUBLISHED
          : data.scheduledAt
            ? PresentationStatus.SCHEDULED
            : PresentationStatus.DRAFT,
      recordingPreference:
        data.presentationType === PresentationType.RECORDED
          ? RecordingPreference.NONE
          : (data.recordingPreference ?? RecordingPreference.NONE),
    };

    if (data.presentationType === PresentationType.RECORDED) {
      presentationData.visibility = "public" as IPresentation["visibility"];
    }

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

  async findById(presentationId: string) {
    if (!Types.ObjectId.isValid(presentationId)) {
      throw new AppError("Invalid presentation ID.", 400);
    }

    const presentation = await presentationRepository.findById(new Types.ObjectId(presentationId));

    if (!presentation) {
      throw new AppError("Presentation not found.", 404);
    }

    return presentation;
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
    data: Partial<IPresentation>,
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
    const updates: Partial<IPresentation> = {};

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

      const scheduledAt = new Date(data.scheduledAt);

      if (Number.isNaN(scheduledAt.getTime())) {
        throw new AppError("Invalid scheduled date.", 400);
      }

      if (scheduledAt.getTime() < Date.now()) {
        throw new AppError("Presentation cannot be scheduled in the past.", 400);
      }

      updates.scheduledAt = scheduledAt;
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

    // 6. Keep recorded presentations public
    if (existing.presentationType === PresentationType.RECORDED) {
      updates.visibility = PresentationVisibility.PUBLIC;
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
}

export const presentationService = new PresentationService();
