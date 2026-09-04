import type { Request, Response } from "express";
import { AppError } from "../../utils/app-error.js";
import { walletService } from "./wallet.service.js";
import { Types } from "mongoose";

class WalletController {
  async getBalance(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userId = new Types.ObjectId(req.user.sub);

    const balance = await walletService.getBalance(userId);

    res.status(200).json({
      success: true,
      data: {
        balance,
      },
    });
  }

  async getTransactions(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userId = new Types.ObjectId(req.user.sub);

    const { limit, cursor } = req.query;

    const parsedLimit = typeof limit === "string" ? Number(limit) : undefined;

    if (parsedLimit !== undefined && Number.isNaN(parsedLimit)) {
      throw new AppError("Invalid limit", 400);
    }

    if (cursor !== undefined && typeof cursor !== "string") {
      throw new AppError("Invalid cursor", 400);
    }

    const result = await walletService.getTransactions({
      userId,
      limit: parsedLimit,
      cursor: typeof cursor === "string" ? cursor : undefined,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  async credit(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userId = new Types.ObjectId(req.user.sub);
    const { amount, source, referenceId, idempotencyKey, description } = req.body;
    const input = { userId, amount, source, referenceId, idempotencyKey, description };

    const transaction = await walletService.credit(input);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  }

  async debit(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid user ID", 400);
    }

    const userId = new Types.ObjectId(req.user.sub);
    const { amount, source, referenceId, idempotencyKey, description } = req.body;
    const input = { userId, amount, source, referenceId, idempotencyKey, description };

    const transaction = await walletService.debit(input);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  }

  async transfer(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!Types.ObjectId.isValid(req.user.sub)) {
      throw new AppError("Invalid user ID", 400);
    }

    const fromUserId = new Types.ObjectId(req.user.sub);
    const { toUserId, amount, source, referenceId, idempotencyKey, description } = req.body;

    if (typeof toUserId !== "string" || !Types.ObjectId.isValid(toUserId)) {
      throw new AppError("Invalid recipient user ID", 400);
    }

    const input = {
      fromUserId,
      toUserId: new Types.ObjectId(toUserId),
      amount,
      source,
      referenceId,
      idempotencyKey,
      description,
    };

    const transaction = await walletService.transfer(input);

    res.status(201).json({
      success: true,
      data: transaction,
    });
  }
}
export const walletController = new WalletController();
