import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { presentationRepository } from "./presentation.repository.js";
import type { IPresentation } from "./presentation.types.js";
import { PresentationStatus, PresentationType, RecordingPreference } from "./presentation.enums.js";
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
}

export const presentationService = new PresentationService();
