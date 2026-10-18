import type { Types } from "mongoose";
import { Connection } from "./connection.model.js";
import type { IConnection } from "./connection.types.js";
import { ConnectionStatus } from "./connection.enums.js";

export class ConnectionRepository {
  async findByParticipantKey(participantKey: string): Promise<IConnection | null> {
    return Connection.findOne({ participantKey }).exec();
  }

  async findById(
    connectionId: Types.ObjectId,
    session?: import("mongoose").ClientSession,
  ): Promise<IConnection | null> {
    return Connection.findById(connectionId)
      .session(session ?? null)
      .exec();
  }

  async findIncomingRequests(userId: Types.ObjectId, limit: number): Promise<IConnection[]> {
    return Connection.find({
      recipientId: userId,
      status: ConnectionStatus.PENDING,
    })
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  async findOutgoingRequests(userId: Types.ObjectId, limit: number): Promise<IConnection[]> {
    return Connection.find({
      requesterId: userId,
      status: ConnectionStatus.PENDING,
    })
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  async findAcceptedConnections(userId: Types.ObjectId, limit: number): Promise<IConnection[]> {
    return Connection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: ConnectionStatus.ACCEPTED,
    })
      .sort({ _id: -1 })
      .limit(limit)
      .exec();
  }

  async create(
    data: Pick<IConnection, "requesterId" | "recipientId" | "participantKey" | "status">,
  ): Promise<IConnection> {
    return Connection.create(data);
  }

  async deleteById(connectionId: Types.ObjectId): Promise<IConnection | null> {
    return Connection.findByIdAndDelete(connectionId).exec();
  }

  async acceptPendingRequest(
    connectionId: Types.ObjectId,
    recipientId: Types.ObjectId,
    session: import("mongoose").ClientSession,
  ): Promise<IConnection | null> {
    return Connection.findOneAndUpdate(
      {
        _id: connectionId,
        recipientId,
        status: ConnectionStatus.PENDING,
      },
      {
        $set: { status: ConnectionStatus.ACCEPTED },
      },
      {
        new: true,
        session,
      },
    ).exec();
  }

  async declineIncomingRequest(
    connectionId: Types.ObjectId,
    recipientId: Types.ObjectId,
    session: import("mongoose").ClientSession,
  ): Promise<IConnection | null> {
    return Connection.findOneAndDelete(
      {
        _id: connectionId,
        recipientId,
        status: ConnectionStatus.PENDING,
      },
      { session },
    ).exec();
  }

  async cancelOutgoingRequest(
    connectionId: Types.ObjectId,
    requesterId: Types.ObjectId,
    session: import("mongoose").ClientSession,
  ): Promise<IConnection | null> {
    return Connection.findOneAndDelete(
      {
        _id: connectionId,
        requesterId,
        status: ConnectionStatus.PENDING,
      },
      { session },
    ).exec();
  }

  async deleteAcceptedConnection(
    connectionId: Types.ObjectId,
    userId: Types.ObjectId,
    session: import("mongoose").ClientSession,
  ): Promise<IConnection | null> {
    return Connection.findOneAndDelete(
      {
        _id: connectionId,
        status: ConnectionStatus.ACCEPTED,
        $or: [{ requesterId: userId }, { recipientId: userId }],
      },
      { session },
    ).exec();
  }
}

export const connectionRepository = new ConnectionRepository();
