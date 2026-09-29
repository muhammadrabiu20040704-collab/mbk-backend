import type { MessageStatus, MessageType } from "../modules/messages/messages.enums.js";

export interface SocketUser {
  id: string;
  username: string;
}

export interface SocketData {
  user?: SocketUser;
}

/**
 * Client → Server
 */
export interface ClientToServerEvents {
  "message:conversation:join": (
    payload: {
      conversationId: string;
    },
    ack?: (response: SocketAck) => void,
  ) => void;

  "message:conversation:leave": (
    payload: {
      conversationId: string;
    },
    ack?: (response: SocketAck) => void,
  ) => void;

  "message:send": (
    payload: {
      conversationId: string;
      type: MessageType;
      text?: string;
    },
    ack?: (response: MessageSendAck) => void,
  ) => void;

  "message:delivered": (
    payload: {
      messageId: string;
    },
    ack?: (response: SocketAck) => void,
  ) => void;

  "message:read": (
    payload: {
      messageId: string;
    },
    ack?: (response: SocketAck) => void,
  ) => void;
}

/**
 * Server → Client
 */
export interface ServerToClientEvents {
  "message:new": (payload: { message: SocketMessage }) => void;

  "message:status": (payload: { messageId: string; status: MessageStatus }) => void;

  "socket:error": (payload: { code: string; message: string }) => void;
}

/**
 * Server ↔ Server
 */
export type InterServerEvents = Record<string, never>;

/**
 * Generic acknowledgement
 */
export type SocketAck = {
  success: boolean;
  error?: {
    code: string;
    message: string;
  };
};

/**
 * message:send acknowledgement
 */
export type MessageSendAck = {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
  };
};

/**
 * Safe message representation sent through Socket.IO.
 */
export interface SocketMessage {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  text?: string;
  status: MessageStatus;
  createdAt: Date;
  updatedAt: Date;
}
