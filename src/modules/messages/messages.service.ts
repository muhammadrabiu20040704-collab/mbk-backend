import type { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { ConversationType, MessageStatus, MessageType } from "./messages.enums.js";
import { conversationRepository } from "./conversation.repository.js";
import { messageRepository } from "./message.repository.js";
import type { IConversation } from "./conversation.types.js";
import type { IMessage, IPaginatedMessages } from "./message.types.js";
import type { UploadedMedia } from "../../shared/media/media.types.js";

export class MessagesService {
  private buildParticipantKey(userIdA: Types.ObjectId, userIdB: Types.ObjectId): string {
    return [userIdA.toString(), userIdB.toString()].sort().join(":");
  }

  private ensureDifferentUsers(userIdA: Types.ObjectId, userIdB: Types.ObjectId): void {
    if (userIdA.equals(userIdB)) {
      throw new AppError("You cannot start a conversation with yourself.", 400);
    }
  }

  private ensureParticipant(
    conversationParticipants: Types.ObjectId[],
    userId: Types.ObjectId,
  ): void {
    const isParticipant = conversationParticipants.some((participantId) =>
      participantId.equals(userId),
    );

    if (!isParticipant) {
      throw new AppError("You are not a participant in this conversation.", 403);
    }
  }

  private ensureValidMessageType(type: MessageType): void {
    if (!Object.values(MessageType).includes(type)) {
      throw new AppError("Invalid message type.", 400);
    }
  }

  async createDirectConversation(
    currentUserId: Types.ObjectId,
    otherUserId: Types.ObjectId,
  ): Promise<IConversation> {
    this.ensureDifferentUsers(currentUserId, otherUserId);

    const participantKey = this.buildParticipantKey(currentUserId, otherUserId);

    const existingConversation = await conversationRepository.findByParticipantKey(participantKey);

    if (existingConversation) {
      return existingConversation;
    }

    return conversationRepository.create({
      participants: [currentUserId, otherUserId],
      participantKey,
      type: ConversationType.DIRECT,
    });
  }

  async getConversation(
    conversationId: Types.ObjectId,
    currentUserId: Types.ObjectId,
  ): Promise<IConversation> {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, currentUserId);

    return conversation;
  }

  async getUserConversations(currentUserId: Types.ObjectId): Promise<IConversation[]> {
    return conversationRepository.findByUserId(currentUserId);
  }

  async sendTextMessage(
    conversationId: Types.ObjectId,
    senderId: Types.ObjectId,
    text: string,
  ): Promise<IMessage> {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, senderId);

    this.ensureValidMessageType(MessageType.TEXT);

    const trimmedText = text.trim();

    if (!trimmedText) {
      throw new AppError("Message text is required.", 400);
    }

    if (trimmedText.length > 2000) {
      throw new AppError("Message cannot exceed 2000 characters.", 400);
    }

    const message = await messageRepository.create({
      conversationId,
      senderId,
      type: MessageType.TEXT,
      text: trimmedText,
      status: MessageStatus.SENT,
    });

    await this.updateConversationLastMessage(conversationId, message);

    return message;
  }

  async sendMediaMessage(
    conversationId: Types.ObjectId,
    senderId: Types.ObjectId,
    type: MessageType.IMAGE | MessageType.VIDEO,
    media: UploadedMedia,
  ): Promise<IMessage> {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, senderId);

    if (type !== MessageType.IMAGE && type !== MessageType.VIDEO) {
      throw new AppError("Invalid media message type.", 400);
    }

    if (!media?.url || !media?.publicId || !media?.resourceType) {
      throw new AppError("Valid media data is required.", 400);
    }

    if (type === MessageType.IMAGE && media.resourceType !== "image") {
      throw new AppError("Image message requires image media.", 400);
    }

    if (type === MessageType.VIDEO && media.resourceType !== "video") {
      throw new AppError("Video message requires video media.", 400);
    }

    const message = await messageRepository.create({
      conversationId,
      senderId,
      type,
      media,
      status: MessageStatus.SENT,
    });

    await this.updateConversationLastMessage(conversationId, message);

    return message;
  }

  async getMessages(
    conversationId: Types.ObjectId,
    currentUserId: Types.ObjectId,
    limit = 30,
    cursor?: string,
  ): Promise<IPaginatedMessages> {
    const conversation = await conversationRepository.findById(conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, currentUserId);

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    let cursorDate: Date | undefined;

    if (cursor) {
      const parsedCursor = new Date(cursor);

      if (Number.isNaN(parsedCursor.getTime())) {
        throw new AppError("Invalid message cursor.", 400);
      }

      cursorDate = parsedCursor;
    }

    const messages = await messageRepository.findByConversation(
      conversationId,
      safeLimit + 1,
      cursorDate,
    );

    const hasNextPage = messages.length > safeLimit;
    const resultMessages = hasNextPage ? messages.slice(0, safeLimit) : messages;

    const nextCursor =
      hasNextPage && resultMessages.length > 0
        ? resultMessages[resultMessages.length - 1].createdAt?.toISOString()
        : undefined;

    return {
      messages: resultMessages,
      nextCursor,
      hasNextPage,
    };
  }

  async markMessageAsDelivered(
    messageId: Types.ObjectId,
    currentUserId: Types.ObjectId,
  ): Promise<IMessage> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found.", 404);
    }

    const conversation = await conversationRepository.findById(message.conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, currentUserId);

    if (message.senderId.equals(currentUserId)) {
      throw new AppError("The sender cannot mark their own message as delivered.", 400);
    }

    if (message.status === MessageStatus.READ) {
      return message;
    }

    if (message.status !== MessageStatus.SENT) {
      throw new AppError("Invalid message status transition.", 400);
    }

    const updatedMessage = await messageRepository.updateStatus(messageId, MessageStatus.DELIVERED);

    if (!updatedMessage) {
      throw new AppError("Failed to update message status.", 500);
    }

    return updatedMessage;
  }

  async markMessageAsRead(
    messageId: Types.ObjectId,
    currentUserId: Types.ObjectId,
  ): Promise<IMessage> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found.", 404);
    }

    const conversation = await conversationRepository.findById(message.conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, currentUserId);

    if (message.senderId.equals(currentUserId)) {
      throw new AppError("The sender cannot mark their own message as read.", 400);
    }

    if (message.status === MessageStatus.READ) {
      return message;
    }

    if (message.status !== MessageStatus.DELIVERED) {
      throw new AppError("Message must be delivered before it can be marked as read.", 400);
    }

    const updatedMessage = await messageRepository.updateStatus(messageId, MessageStatus.READ);

    if (!updatedMessage) {
      throw new AppError("Failed to update message status.", 500);
    }

    return updatedMessage;
  }

  async deleteMessage(messageId: Types.ObjectId, currentUserId: Types.ObjectId): Promise<IMessage> {
    const message = await messageRepository.findById(messageId);

    if (!message) {
      throw new AppError("Message not found.", 404);
    }

    const conversation = await conversationRepository.findById(message.conversationId);

    if (!conversation) {
      throw new AppError("Conversation not found.", 404);
    }

    this.ensureParticipant(conversation.participants, currentUserId);

    if (!message.senderId.equals(currentUserId)) {
      throw new AppError("You can only delete your own messages.", 403);
    }

    const deletedMessage = await messageRepository.delete(messageId);

    if (!deletedMessage) {
      throw new AppError("Failed to delete message.", 500);
    }

    return deletedMessage;
  }

  private async updateConversationLastMessage(
    conversationId: Types.ObjectId,
    message: IMessage,
  ): Promise<void> {
    if (!message.createdAt) {
      throw new AppError("Message creation time is missing.", 500);
    }

    const updatedConversation = await conversationRepository.updateLastMessage(
      conversationId,
      message._id,
      message.createdAt,
    );

    if (!updatedConversation) {
      throw new AppError("Failed to update conversation.", 500);
    }
  }
}

export const messagesService = new MessagesService();
