import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";

import { authenticateSocket } from "./socket.auth.js";
import { registerMessageSocketEvents } from "../modules/messages/messages.socket.js";

import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socket.types.js";

export const initializeSocket = (
  httpServer: HttpServer,
): SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> => {
  const io = new SocketIOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer);

  io.use((socket, next) => {
    try {
      authenticateSocket(socket);
      next();
    } catch (error) {
      if (error instanceof Error) {
        next(error);
        return;
      }

      next(new Error("Socket authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerMessageSocketEvents(socket);

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} - ${reason}`);
    });
  });

  return io;
};
