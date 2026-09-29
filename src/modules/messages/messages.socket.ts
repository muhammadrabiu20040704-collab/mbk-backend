import type { Socket } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
  SocketAck,
  SocketMessage,
} from "../../sockets/socket.types.js";
import { messagesService } from "./messages.service.js";
import { MessageType } from "./messages.enums.js";
import { SOCKET_ROOMS } from "../../sockets/socket.rooms.js";
import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";

type MBKSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const registerMessageSocketEvents = (socket: MBKSocket): void => {
  /**
   * JOIN CONVERSATION
   */
  socket.on("message:conversation:join", async (payload, ack) => {
    try {
      if (!socket.data.user) {
        throw new AppError("Unauthorized", 401);
      }

      if (!Types.ObjectId.isValid(payload.conversationId)) {
        throw new AppError("Invalid conversation ID.", 400);
      }

      const conversationId = new Types.ObjectId(payload.conversationId);
      const currentUserId = new Types.ObjectId(socket.data.user.id);

      await messagesService.getConversation(conversationId, currentUserId);

      const room = SOCKET_ROOMS.conversation(payload.conversationId);

      await socket.join(room);

      const response: SocketAck = {
        success: true,
      };

      ack?.(response);
    } catch (error) {
      console.error("❌ message:conversation:join error:", error);

      if (error instanceof AppError) {
        ack?.({
          success: false,
          error: {
            code: String(error.statusCode),
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof Error) {
        ack?.({
          success: false,
          error: {
            code: "SOCKET_ERROR",
            message: error.message,
          },
        });

        return;
      }

      ack?.({
        success: false,
        error: {
          code: "SOCKET_ERROR",
          message: "Failed to join conversation.",
        },
      });
    }
  });

  /**
   * LEAVE CONVERSATION
   */
  socket.on("message:conversation:leave", async (payload, ack) => {
    try {
      if (!socket.data.user) {
        throw new AppError("Unauthorized", 401);
      }

      if (!Types.ObjectId.isValid(payload.conversationId)) {
        throw new AppError("Invalid conversation ID.", 400);
      }

      const conversationId = new Types.ObjectId(payload.conversationId);
      const currentUserId = new Types.ObjectId(socket.data.user.id);

      await messagesService.getConversation(conversationId, currentUserId);

      const room = SOCKET_ROOMS.conversation(payload.conversationId);

      await socket.leave(room);

      const response: SocketAck = {
        success: true,
      };

      ack?.(response);
    } catch (error) {
      console.error("❌ message:conversation:leave error:", error);

      if (error instanceof AppError) {
        ack?.({
          success: false,
          error: {
            code: String(error.statusCode),
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof Error) {
        ack?.({
          success: false,
          error: {
            code: "SOCKET_ERROR",
            message: error.message,
          },
        });

        return;
      }

      ack?.({
        success: false,
        error: {
          code: "SOCKET_ERROR",
          message: "Failed to leave conversation.",
        },
      });
    }
  });

  /**
   * SEND TEXT MESSAGE
   */
  socket.on("message:send", async (payload, ack) => {
    try {
      if (!socket.data.user) {
        throw new AppError("Unauthorized", 401);
      }

      if (!Types.ObjectId.isValid(payload.conversationId)) {
        throw new AppError("Invalid conversation ID.", 400);
      }

      if (payload.type !== MessageType.TEXT) {
        throw new AppError("Only text messages are supported.", 400);
      }

      const text = payload.text?.trim();

      if (!text) {
        throw new AppError("Message text is required.", 400);
      }

      const conversationId = new Types.ObjectId(payload.conversationId);
      const senderId = new Types.ObjectId(socket.data.user.id);

      const message = await messagesService.sendTextMessage(conversationId, senderId, text);

      const room = SOCKET_ROOMS.conversation(payload.conversationId);

      const socketMessage: SocketMessage = {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        senderId: message.senderId.toString(),
        type: message.type,
        text: message.text,
        status: message.status,
        createdAt: message.createdAt ?? new Date(),
        updatedAt: message.updatedAt ?? new Date(),
      };

      socket.to(room).emit("message:new", {
        message: socketMessage,
      });

      ack?.({
        success: true,
        messageId: message._id.toString(),
      });
    } catch (error) {
      console.error("❌ message:send error:", error);

      if (error instanceof AppError) {
        ack?.({
          success: false,
          error: {
            code: String(error.statusCode),
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof Error) {
        ack?.({
          success: false,
          error: {
            code: "SOCKET_ERROR",
            message: error.message,
          },
        });

        return;
      }

      ack?.({
        success: false,
        error: {
          code: "SOCKET_ERROR",
          message: "Failed to send message.",
        },
      });
    }
  });

  /**
   * MARK MESSAGE AS DELIVERED
   */
  socket.on("message:delivered", async (payload, ack) => {
    try {
      if (!socket.data.user) {
        throw new AppError("Unauthorized", 401);
      }

      if (!Types.ObjectId.isValid(payload.messageId)) {
        throw new AppError("Invalid message ID.", 400);
      }

      const messageId = new Types.ObjectId(payload.messageId);
      const currentUserId = new Types.ObjectId(socket.data.user.id);

      const message = await messagesService.markMessageAsDelivered(messageId, currentUserId);

      const room = SOCKET_ROOMS.conversation(message.conversationId.toString());

      socket.to(room).emit("message:status", {
        messageId: message._id.toString(),
        status: message.status,
      });

      ack?.({
        success: true,
      });
    } catch (error) {
      console.error("❌ message:delivered error:", error);

      if (error instanceof AppError) {
        ack?.({
          success: false,
          error: {
            code: String(error.statusCode),
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof Error) {
        ack?.({
          success: false,
          error: {
            code: "SOCKET_ERROR",
            message: error.message,
          },
        });

        return;
      }

      ack?.({
        success: false,
        error: {
          code: "SOCKET_ERROR",
          message: "Failed to mark message as delivered.",
        },
      });
    }
  });

  /**
   * MARK MESSAGE AS READ
   */
  socket.on("message:read", async (payload, ack) => {
    try {
      if (!socket.data.user) {
        throw new AppError("Unauthorized", 401);
      }

      if (!Types.ObjectId.isValid(payload.messageId)) {
        throw new AppError("Invalid message ID.", 400);
      }

      const messageId = new Types.ObjectId(payload.messageId);
      const currentUserId = new Types.ObjectId(socket.data.user.id);

      const message = await messagesService.markMessageAsRead(messageId, currentUserId);

      const room = SOCKET_ROOMS.conversation(message.conversationId.toString());

      socket.to(room).emit("message:status", {
        messageId: message._id.toString(),
        status: message.status,
      });

      ack?.({
        success: true,
      });
    } catch (error) {
      console.error("❌ message:read error:", error);

      if (error instanceof AppError) {
        ack?.({
          success: false,
          error: {
            code: String(error.statusCode),
            message: error.message,
          },
        });

        return;
      }

      if (error instanceof Error) {
        ack?.({
          success: false,
          error: {
            code: "SOCKET_ERROR",
            message: error.message,
          },
        });

        return;
      }

      ack?.({
        success: false,
        error: {
          code: "SOCKET_ERROR",
          message: "Failed to mark message as read.",
        },
      });
    }
  });
};
