import { Schema, model } from "mongoose";
import type { IMessage } from "./message.types.js";
import { MessageStatus, MessageType } from "./messages.enums.js";

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(MessageType),
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    media: {
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
      width: Number,
      height: Number,
      format: String,
      bytes: Number,
    },

    status: {
      type: String,
      enum: Object.values(MessageStatus),
      required: true,
      default: MessageStatus.SENT,
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>("Message", messageSchema);
