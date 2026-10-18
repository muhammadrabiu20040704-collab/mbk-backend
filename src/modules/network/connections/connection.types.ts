import type { Types } from "mongoose";
import { ConnectionStatus } from "./connection.enums.js";

export interface IConnection {
  requesterId: Types.ObjectId;
  recipientId: Types.ObjectId;
  participantKey: string;
  status: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}
