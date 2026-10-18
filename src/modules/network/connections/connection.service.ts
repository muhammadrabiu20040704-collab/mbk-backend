import { startSession, Types } from "mongoose";
import { AppError } from "../../../utils/app-error.js";
import { User } from "../../users/user.model.js";
import { ConnectionStatus } from "./connection.enums.js";
import { connectionRepository } from "./connection.repository.js";
import type { IConnection } from "./connection.types.js";

class ConnectionService {
  private createParticipantKey(firstUserId: Types.ObjectId, secondUserId: Types.ObjectId): string {
    return [firstUserId.toString(), secondUserId.toString()].sort().join(":");
  }

  private validateObjectId(value: Types.ObjectId, fieldName: string): void {
    if (!Types.ObjectId.isValid(value)) {
      throw new AppError(`Invalid ${fieldName}`, 400);
    }
  }

  async sendRequest(
    requesterId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ): Promise<IConnection> {
    this.validateObjectId(requesterId, "requester ID");
    this.validateObjectId(recipientId, "recipient ID");

    if (requesterId.equals(recipientId)) {
      throw new AppError("You cannot send a connection request to yourself", 400);
    }

    const recipient = await User.findById(recipientId).select("_id").lean();

    if (!recipient) {
      throw new AppError("Student not found", 404);
    }

    const participantKey = this.createParticipantKey(requesterId, recipientId);

    const existingConnection = await connectionRepository.findByParticipantKey(participantKey);

    if (existingConnection) {
      if (existingConnection.status === ConnectionStatus.ACCEPTED) {
        throw new AppError("You are already connected", 409);
      }

      if (existingConnection.requesterId.equals(requesterId)) {
        throw new AppError("Connection request already sent", 409);
      }

      throw new AppError(
        "This student has already sent you a request. You can accept it instead.",
        409,
      );
    }

    try {
      return await connectionRepository.create({
        requesterId,
        recipientId,
        participantKey,
        status: ConnectionStatus.PENDING,
      });
    } catch (error: unknown) {
      // The unique participantKey index protects against concurrent requests.
      if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
        throw new AppError("A connection request or connection already exists", 409);
      }

      throw error;
    }
  }

  async acceptRequest(
    connectionId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ): Promise<IConnection> {
    this.validateObjectId(connectionId, "connection ID");
    this.validateObjectId(recipientId, "recipient ID");

    const session = await startSession();

    let acceptedConnection: IConnection | null = null;

    try {
      await session.withTransaction(async () => {
        const connection = await connectionRepository.findById(connectionId, session);

        if (!connection) {
          throw new AppError("Connection request not found", 404);
        }

        if (!connection.recipientId.equals(recipientId)) {
          throw new AppError("You are not authorized to accept this request", 403);
        }

        if (connection.status !== ConnectionStatus.PENDING) {
          throw new AppError("This connection request is no longer pending", 409);
        }

        const updatedConnection = await connectionRepository.acceptPendingRequest(
          connectionId,
          recipientId,
          session,
        );

        if (!updatedConnection) {
          throw new AppError("Unable to accept this connection request", 409);
        }

        const requesterUpdate = await User.updateOne(
          { _id: connection.requesterId },
          { $inc: { connectionsCount: 1 } },
          { session },
        );

        const recipientUpdate = await User.updateOne(
          { _id: connection.recipientId },
          { $inc: { connectionsCount: 1 } },
          { session },
        );

        if (requesterUpdate.matchedCount !== 1 || recipientUpdate.matchedCount !== 1) {
          throw new AppError("Unable to update student connection counts", 500);
        }

        acceptedConnection = updatedConnection;
      });

      if (!acceptedConnection) {
        throw new AppError("Unable to accept this connection request", 500);
      }

      return acceptedConnection;
    } finally {
      await session.endSession();
    }
  }

  async declineRequest(
    connectionId: Types.ObjectId,
    recipientId: Types.ObjectId,
  ): Promise<IConnection> {
    this.validateObjectId(connectionId, "connection ID");
    this.validateObjectId(recipientId, "recipient ID");

    const session = await startSession();

    let declinedConnection: IConnection | null = null;

    try {
      await session.withTransaction(async () => {
        const connection = await connectionRepository.findById(connectionId, session);

        if (!connection) {
          throw new AppError("Connection request not found", 404);
        }

        if (!connection.recipientId.equals(recipientId)) {
          throw new AppError("You are not authorized to decline this request", 403);
        }

        if (connection.status !== ConnectionStatus.PENDING) {
          throw new AppError("This connection request is no longer pending", 409);
        }

        const deletedConnection = await connectionRepository.declineIncomingRequest(
          connectionId,
          recipientId,
          session,
        );

        if (!deletedConnection) {
          throw new AppError("Unable to decline this connection request", 409);
        }

        declinedConnection = deletedConnection;
      });

      if (!declinedConnection) {
        throw new AppError("Unable to decline this request", 500);
      }

      return declinedConnection;
    } finally {
      await session.endSession();
    }
  }

  async cancelRequest(
    connectionId: Types.ObjectId,
    requesterId: Types.ObjectId,
  ): Promise<IConnection> {
    this.validateObjectId(connectionId, "connection ID");
    this.validateObjectId(requesterId, "requester ID");

    const session = await startSession();

    let cancelledConnection: IConnection | null = null;

    try {
      await session.withTransaction(async () => {
        const connection = await connectionRepository.findById(connectionId, session);

        if (!connection) {
          throw new AppError("Connection request not found", 404);
        }

        if (!connection.requesterId.equals(requesterId)) {
          throw new AppError("You are not authorized to cancel this request", 403);
        }

        if (connection.status !== ConnectionStatus.PENDING) {
          throw new AppError("This connection request is no longer pending", 409);
        }

        const deletedConnection = await connectionRepository.cancelOutgoingRequest(
          connectionId,
          requesterId,
          session,
        );

        if (!deletedConnection) {
          throw new AppError("Unable to cancel this connection request", 409);
        }

        cancelledConnection = deletedConnection;
      });

      if (!cancelledConnection) {
        throw new AppError("Unable to cancel this request", 500);
      }

      return cancelledConnection;
    } finally {
      await session.endSession();
    }
  }

  async removeConnection(
    connectionId: Types.ObjectId,
    userId: Types.ObjectId,
  ): Promise<IConnection> {
    this.validateObjectId(connectionId, "connection ID");
    this.validateObjectId(userId, "user ID");

    const session = await startSession();

    let removedConnection: IConnection | null = null;

    try {
      await session.withTransaction(async () => {
        const connection = await connectionRepository.findById(connectionId, session);

        if (!connection) {
          throw new AppError("Connection not found", 404);
        }

        const isRequester = connection.requesterId.equals(userId);
        const isRecipient = connection.recipientId.equals(userId);

        if (!isRequester && !isRecipient) {
          throw new AppError("You are not authorized to remove this connection", 403);
        }

        if (connection.status !== ConnectionStatus.ACCEPTED) {
          throw new AppError("Only accepted connections can be removed", 409);
        }

        const deletedConnection = await connectionRepository.deleteAcceptedConnection(
          connectionId,
          userId,
          session,
        );

        if (!deletedConnection) {
          throw new AppError("Unable to remove this connection", 409);
        }

        const requesterUpdate = await User.updateOne(
          {
            _id: deletedConnection.requesterId,
            connectionsCount: { $gt: 0 },
          },
          {
            $inc: { connectionsCount: -1 },
          },
          { session },
        );

        const recipientUpdate = await User.updateOne(
          {
            _id: deletedConnection.recipientId,
            connectionsCount: { $gt: 0 },
          },
          {
            $inc: { connectionsCount: -1 },
          },
          { session },
        );

        if (requesterUpdate.matchedCount !== 1 || recipientUpdate.matchedCount !== 1) {
          throw new AppError("Unable to update connection counts", 500);
        }

        removedConnection = deletedConnection;
      });

      if (!removedConnection) {
        throw new AppError("Unable to remove this connection", 500);
      }

      return removedConnection;
    } finally {
      await session.endSession();
    }
  }

  async getIncomingRequests(userId: Types.ObjectId, limit = 20) {
    this.validateObjectId(userId, "user ID");

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return connectionRepository.findIncomingRequests(userId, safeLimit);
  }

  async getOutgoingRequests(userId: Types.ObjectId, limit = 20) {
    this.validateObjectId(userId, "user ID");

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return connectionRepository.findOutgoingRequests(userId, safeLimit);
  }

  async getConnections(userId: Types.ObjectId, limit = 20) {
    this.validateObjectId(userId, "user ID");

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    return connectionRepository.findAcceptedConnections(userId, safeLimit);
  }
}

export const connectionService = new ConnectionService();
