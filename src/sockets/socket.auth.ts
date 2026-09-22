import type { Socket } from "socket.io";
import { jwtService } from "../shared/jwt/jwt.service.js";
import { AppError } from "@utils/app-error.js";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socket.types.js";

type MBKSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const authenticateSocket = (socket: MBKSocket): void => {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== "string") {
    throw new AppError("Unauthorized", 401);
  }

  const payload = jwtService.verifyAccessToken(token);

  socket.data.user = {
    id: payload.sub,
    username: payload.username,
  };
};
