import { Schema, model } from "mongoose";
import {
  IPost,
  IPostMedia,
  IPostSettings,
  PostAudience,
  PostStatus,
  PostType,
} from "./post.types.js";

const postMediaSchema = new Schema<IPostMedia>(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      trim: true,
    },

    type: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    width: {
      type: Number,
      min: 1,
    },

    height: {
      type: Number,
      min: 1,
    },

    duration: {
      type: Number,
      min: 0,
    },
  },
  { _id: false },
);

const postSettingsSchema = new Schema<IPostSettings>(
  {
    allowComments: {
      type: Boolean,
      default: true,
    },

    allowShares: {
      type: Boolean,
      default: true,
    },

    allowMentions: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(PostType),
      required: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    media: {
      type: [postMediaSchema],
      default: [],
    },

    audience: {
      type: String,
      enum: Object.values(PostAudience),
      default: PostAudience.PUBLIC,
      required: true,
    },

    location: {
      name: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },

    settings: {
      type: postSettingsSchema,
      default: () => ({}),
    },

    likesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    commentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sharesCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.DRAFT,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);
