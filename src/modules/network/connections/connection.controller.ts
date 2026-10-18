import type { Request, Response } from "express";
import { Types } from "mongoose";
import { AppError } from "@utils/app-error.js";
import { connectionService } from "./connection.service.js";

export class ConnectionController {
  private getCurrentUserId(req: Request): Types.ObjectId {
    if (!req.user) {
      throw new AppError("Authentication required.", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid authenticated user ID.", 401);
    }

    return new Types.ObjectId(req.user.sub);
  }

  private getValidParamId(value: unknown, fieldName: string): Types.ObjectId {
    if (typeof value !== "string" || !Types.ObjectId.isValid(value)) {
      throw new AppError(`Invalid ${fieldName}.`, 400);
    }

    return new Types.ObjectId(value);
  }

  private getLimit(req: Request): number {
    if (req.query.limit === undefined) {
      return 20;
    }

    const limit = Number(req.query.limit);

    if (!Number.isInteger(limit) || limit < 1) {
      throw new AppError("Limit must be a positive integer.", 400);
    }

    return Math.min(limit, 50);
  }

  async sendRequest(req: Request, res: Response): Promise<Response> {
    const requesterId = this.getCurrentUserId(req);
    const recipientId = this.getValidParamId(req.params.userId, "recipient user ID");

    const connection = await connectionService.sendRequest(requesterId, recipientId);

    return res.status(201).json({
      success: true,
      message: "Connection request sent successfully.",
      data: connection,
    });
  }

  async getIncomingRequests(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);
    const limit = this.getLimit(req);

    const connections = await connectionService.getIncomingRequests(currentUserId, limit);

    return res.status(200).json({
      success: true,
      message: "Incoming connection requests retrieved successfully.",
      data: connections,
    });
  }

  async getOutgoingRequests(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);
    const limit = this.getLimit(req);

    const connections = await connectionService.getOutgoingRequests(currentUserId, limit);

    return res.status(200).json({
      success: true,
      message: "Outgoing connection requests retrieved successfully.",
      data: connections,
    });
  }

  async getConnections(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);
    const limit = this.getLimit(req);

    const connections = await connectionService.getConnections(currentUserId, limit);

    return res.status(200).json({
      success: true,
      message: "Connections retrieved successfully.",
      data: connections,
    });
  }

  async acceptRequest(req: Request, res: Response): Promise<Response> {
    const recipientId = this.getCurrentUserId(req);
    const connectionId = this.getValidParamId(req.params.connectionId, "connection ID");

    const connection = await connectionService.acceptRequest(connectionId, recipientId);

    return res.status(200).json({
      success: true,
      message: "Connection request accepted successfully.",
      data: connection,
    });
  }

  async declineRequest(req: Request, res: Response): Promise<Response> {
    const recipientId = this.getCurrentUserId(req);
    const connectionId = this.getValidParamId(req.params.connectionId, "connection ID");

    const connection = await connectionService.declineRequest(connectionId, recipientId);

    return res.status(200).json({
      success: true,
      message: "Connection request declined successfully.",
      data: connection,
    });
  }

  async cancelRequest(req: Request, res: Response): Promise<Response> {
    const requesterId = this.getCurrentUserId(req);
    const connectionId = this.getValidParamId(req.params.connectionId, "connection ID");

    const connection = await connectionService.cancelRequest(connectionId, requesterId);

    return res.status(200).json({
      success: true,
      message: "Connection request cancelled successfully.",
      data: connection,
    });
  }

  async removeConnection(req: Request, res: Response): Promise<Response> {
    const currentUserId = this.getCurrentUserId(req);
    const connectionId = this.getValidParamId(req.params.connectionId, "connection ID");

    const connection = await connectionService.removeConnection(connectionId, currentUserId);

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully.",
      data: connection,
    });
  }
}

export const connectionController = new ConnectionController();
