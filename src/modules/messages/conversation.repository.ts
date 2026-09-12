import type { Types } from "mongoose";
import { Conversation } from "./conversation.model.js";
import type { IConversation } from "./conversation.types.js";

export class ConversationRepository {
  async findByParticipantKey(participantKey: string): Promise<IConversation | null> {
    return Conversation.findOne({ participantKey }).exec();
  }

  async findById(conversationId: Types.ObjectId): Promise<IConversation | null> {
    return Conversation.findById(conversationId).exec();
  }

  async findByUserId(userId: Types.ObjectId): Promise<IConversation[]> {
    return Conversation.find({
      participants: userId,
    })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async create(
    data: Pick<IConversation, "participants" | "participantKey" | "type">,
  ): Promise<IConversation> {
    return Conversation.create(data);
  }
}

export const conversationRepository = new ConversationRepository();
