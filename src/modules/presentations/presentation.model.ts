import { Schema, model } from "mongoose";

import type { IPresentation } from "./presentation.types.js";

import {
  PresentationStatus,
  PresentationType,
  PresentationVisibility,
  RecordingPreference,
} from "./presentation.enums.js";

// Uploaded media schema
const uploadedMediaSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      required: true,
      trim: true,
    },

    resourceType: {
      type: String,
      required: true,
      enum: ["image"],
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
  {
    _id: false,
  },
);

// Presentation schema
const presentationSchema = new Schema<IPresentation>(
  {
    presenterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
      type: uploadedMediaSchema,
      default: undefined,
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

// Presenter presentations, sorted by creation date
presentationSchema.index({
  presenterId: 1,
  createdAt: -1,
});

// Public presentation feed
presentationSchema.index({
  visibility: 1,
  status: 1,
  createdAt: -1,
});

// Upcoming live presentations
presentationSchema.index({
  visibility: 1,
  presentationType: 1,
  status: 1,
  scheduledAt: 1,
});

// Category-based presentation listing
presentationSchema.index({
  visibility: 1,
  status: 1,
  category: 1,
  createdAt: -1,
});

// Export Presentation model
export const Presentation = model<IPresentation>("Presentation", presentationSchema);
