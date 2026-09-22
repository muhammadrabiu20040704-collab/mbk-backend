import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "node:http";
import { authenticateSocket } from "./socket.auth.js";

export const initializeSocket = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer);

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

    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.id} - ${reason}`);
    });
  });

  return io;
};
