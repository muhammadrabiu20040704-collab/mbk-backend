import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { messagesService } from "./messages.service.js";
import { MessageType } from "./messages.enums.js";

export class MessagesController {
  private getCurrentUserId(req: Request): Types.ObjectId {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid authenticated user ID.", 401);
    }

    return new Types.ObjectId(req.user.sub);
  }

  async createConversation(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const { otherUserId } = req.body as {
      otherUserId?: string;
    };

    if (!otherUserId || !Types.ObjectId.isValid(otherUserId)) {
      throw new AppError("Valid other user ID is required.", 400);
    }

    const conversation = await messagesService.createDirectConversation(
      currentUserId,
      new Types.ObjectId(otherUserId),
    );

    return res.status(201).json({
      success: true,
      message: "Conversation created successfully.",
      data: conversation,
    });
  }

  async getConversations(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const conversations = await messagesService.getUserConversations(currentUserId);

    return res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully.",
      data: conversations,
    });
  }

  async getConversation(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const conversationId = req.params.conversationId;

    if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) {
      throw new AppError("Invalid conversation ID.", 400);
    }

    const conversation = await messagesService.getConversation(
      new Types.ObjectId(conversationId),
      currentUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Conversation retrieved successfully.",
      data: conversation,
    });
  }

  async sendMessage(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const conversationId = req.params.conversationId;

    if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) {
      throw new AppError("Invalid conversation ID.", 400);
    }

    const { type, text } = req.body as {
      type?: MessageType;
      text?: string;
    };

    if (type !== MessageType.TEXT) {
      throw new AppError("Only text messages are supported by this request.", 400);
    }

    const message = await messagesService.sendTextMessage(
      new Types.ObjectId(conversationId),
      currentUserId,
      text ?? "",
    );

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: message,
    });
  }

  async getMessages(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const conversationId = req.params.conversationId;

    if (typeof conversationId !== "string" || !Types.ObjectId.isValid(conversationId)) {
      throw new AppError("Invalid conversation ID.", 400);
    }

    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    const cursor = req.query.cursor ? String(req.query.cursor) : undefined;

    const result = await messagesService.getMessages(
      new Types.ObjectId(conversationId),
      currentUserId,
      limit,
      cursor,
    );

    return res.status(200).json({
      success: true,
      message: "Messages retrieved successfully.",
      data: result,
    });
  }

  async markMessageAsRead(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const messageId = req.params.messageId;

    if (typeof messageId !== "string" || !Types.ObjectId.isValid(messageId)) {
      throw new AppError("Invalid message ID.", 400);
    }

    const message = await messagesService.markMessageAsRead(
      new Types.ObjectId(messageId),
      currentUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Message marked as read.",
      data: message,
    });
  }

  async markMessageAsDelivered(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const messageId = req.params.messageId;

    if (typeof messageId !== "string" || !Types.ObjectId.isValid(messageId)) {
      throw new AppError("Invalid message ID.", 400);
    }

    const message = await messagesService.markMessageAsDelivered(
      new Types.ObjectId(messageId),
      currentUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Message marked as delivered.",
      data: message,
    });
  }

  async deleteMessage(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);

    const messageId = req.params.messageId;

    if (typeof messageId !== "string" || !Types.ObjectId.isValid(messageId)) {
      throw new AppError("Invalid message ID.", 400);
    }

    const message = await messagesService.deleteMessage(
      new Types.ObjectId(messageId),
      currentUserId,
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
      data: message,
    });
  }
}

export const messagesController = new MessagesController();
