import type { Types } from "mongoose";
import type { UploadedMedia } from "../../shared/media/media.types.js";
import { MessageStatus, MessageType } from "./messages.enums.js";

export interface IMessage {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;

  type: MessageType;

  text?: string;
  media?: UploadedMedia;

  status: MessageStatus;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISendMessageInput {
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;

  type: MessageType;

  text?: string;
  media?: UploadedMedia;
}

export interface IGetMessagesInput {
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;

  limit?: number;
  cursor?: string;
}

export interface IPaginatedMessages {
  messages: IMessage[];
  nextCursor?: string;
  hasNextPage: boolean;
}
