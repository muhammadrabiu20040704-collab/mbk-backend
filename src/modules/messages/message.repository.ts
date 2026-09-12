import type { Types } from "mongoose";
import { Message } from "./message.model.js";
import type { IMessage } from "./message.types.js";
import { MessageStatus } from "./messages.enums.js";

export class MessageRepository {
  async create(data: Omit<IMessage, "createdAt" | "updatedAt">): Promise<IMessage> {
    return Message.create(data);
  }

  async findById(messageId: Types.ObjectId): Promise<IMessage | null> {
    return Message.findById(messageId).exec();
  }

  async findByConversation(
    conversationId: Types.ObjectId,
    limit: number,
    cursor?: Date,
  ): Promise<IMessage[]> {
    const query: {
      conversationId: Types.ObjectId;
      createdAt?: { $lt: Date };
    } = {
      conversationId,
    };

    if (cursor) {
      query.createdAt = { $lt: cursor };
    }

    return Message.find(query).sort({ createdAt: -1 }).limit(limit).exec();
  }

  async updateStatus(messageId: Types.ObjectId, status: MessageStatus): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(messageId, { status }, { new: true }).exec();
  }

  async delete(messageId: Types.ObjectId): Promise<IMessage | null> {
    return Message.findByIdAndDelete(messageId).exec();
  }
}

export const messageRepository = new MessageRepository();
