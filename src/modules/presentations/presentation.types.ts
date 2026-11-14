import type { Types } from "mongoose";

import type {
  PresentationStatus,
  PresentationType,
  PresentationVisibility,
  RecordingPreference,
} from "./presentation.enums.js";
import { UploadedMedia } from "shared/media/media.types.js";

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
