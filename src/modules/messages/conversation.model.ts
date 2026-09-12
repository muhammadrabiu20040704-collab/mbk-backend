import { Schema, model } from "mongoose";
import type { IConversation } from "./conversation.types.js";
import { ConversationType } from "./messages.enums.js";

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      ],
      required: true,
    },

    participantKey: {
      type: String,
      required: true,
      unique: true,
    },

    type: {
      type: String,
      enum: Object.values(ConversationType),
      required: true,
      default: ConversationType.DIRECT,
    },

    lastMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    lastMessageAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({
  participants: 1,
  updatedAt: -1,
});

export const Conversation = model<IConversation>("Conversation", conversationSchema);
