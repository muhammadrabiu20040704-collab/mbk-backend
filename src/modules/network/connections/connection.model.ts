import { Schema, model } from "mongoose";
import type { IConnection } from "./connection.types.js";
import { ConnectionStatus } from "./connection.enums.js";

const connectionSchema = new Schema<IConnection>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    participantKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(ConnectionStatus),
      required: true,
      default: ConnectionStatus.PENDING,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

connectionSchema.index({
  recipientId: 1,
  status: 1,
  _id: -1,
});

connectionSchema.index({
  requesterId: 1,
  status: 1,
  _id: -1,
});

connectionSchema.index({
  participantKey: 1,
  status: 1,
});

export const Connection = model<IConnection>("Connection", connectionSchema);
