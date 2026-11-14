import { Schema, model } from "mongoose";

import type { IPresentation } from "./presentation.types.js";
import {
  PresentationStatus,
  PresentationType,
  PresentationVisibility,
  RecordingPreference,
} from "./presentation.enums.js";

const presentationSchema = new Schema<IPresentation>(
  {
    presenterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    coverImage: {
      url: {
        type: String,
        trim: true,
      },

      publicId: {
        type: String,
        trim: true,
      },

      resourceType: {
        type: String,
        enum: ["image", "video"],
      },

      width: {
        type: Number,
        min: 1,
      },

      height: {
        type: Number,
        min: 1,
      },

      format: {
        type: String,
        trim: true,
      },

      bytes: {
        type: Number,
        min: 0,
      },
    },

    presentationType: {
      type: String,
      enum: Object.values(PresentationType),
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(PresentationStatus),
      required: true,
      default: PresentationStatus.DRAFT,
      index: true,
    },

    visibility: {
      type: String,
      enum: Object.values(PresentationVisibility),
      required: true,
      default: PresentationVisibility.PUBLIC,
    },

    recordingPreference: {
      type: String,
      enum: Object.values(RecordingPreference),
      required: true,
      default: RecordingPreference.NONE,
    },

    scheduledAt: {
      type: Date,
      default: undefined,
      index: true,
    },

    durationMinutes: {
      type: Number,
      min: 1,
      max: 1440,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const Presentation = model<IPresentation>("Presentation", presentationSchema);
