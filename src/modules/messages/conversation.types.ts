import type { Types } from "mongoose";
import { ConversationType } from "./messages.enums.js";

export interface IConversation {
  participants: Types.ObjectId[];

  participantKey: string;

  type: ConversationType;

  lastMessageId?: Types.ObjectId;
  lastMessageAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}
