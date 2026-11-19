import type { Types } from "mongoose";

import type {
  PresentationStatus,
  PresentationType,
  PresentationVisibility,
  RecordingPreference,
} from "./presentation.enums.js";

import type { UploadedMedia } from "shared/media/media.types.js";

export interface IPresentation {
  presenterId: Types.ObjectId;

  title: string;
  description: string;

  category: string;
  topic: string;

  coverImage?: UploadedMedia;

  presentationType: PresentationType;
  status: PresentationStatus;
  visibility: PresentationVisibility;
  recordingPreference: RecordingPreference;

  scheduledAt?: Date;
  durationMinutes?: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface PresentationListFilters {
  visibility?: PresentationVisibility;
  status?: PresentationStatus;
  presentationType?: PresentationType;

  category?: string;
  search?: string;
  scheduledAfter?: Date;
}

export type UpdatePresentationInput = Omit<Partial<IPresentation>, "scheduledAt"> & {
  scheduledAt?: Date | string | null;
};
