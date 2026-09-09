import { ClientSession, Types, startSession } from "mongoose";
import { Wallet } from "./wallet.model.js";
import { WalletTransactionSource, WalletTransactionType } from "./wallet.enums.js";
import { AppError } from "../../utils/app-error.js";
import { WalletTransaction } from "./wallet-transaction.model.js";
import {
  ICreditWalletInput,
  IDebitWalletInput,
  ITransferWalletInput,
  IGetTransactionsInput,
} from "./wallet.types.js";

class WalletService {
  async getOrCreateWallet(userId: Types.ObjectId, session?: ClientSession) {
    let wallet = await Wallet.findOne({ userId }).session(session ?? null);
    if (!wallet) {
      const wallets = await Wallet.create(
        [
          {
            userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
            totalReceived: 0,
          },
        ],
        { session },
      );

      wallet = wallets[0];
    }

    return wallet;
  }

  async credit(input: ICreditWalletInput) {
    const { userId, amount } = input;

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError("Coin amount must be a positive integer", 400);
    }

    const existingTransaction = await WalletTransaction.findOne({
      idempotencyKey: input.idempotencyKey,
    });

    if (existingTransaction) {
      return existingTransaction;
    }

    let createdTransaction;

    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const wallet = await this.getOrCreateWallet(userId, session);

        const balanceBefore = wallet.balance;
        const balanceAfter = balanceBefore + amount;

        const isUserTransfer = input.source === WalletTransactionSource.USER_GIFT;

        wallet.balance = balanceAfter;

        if (isUserTransfer) {
          wallet.totalReceived += amount;
        } else {
          wallet.totalEarned += amount;
        }

        await wallet.save({ session });

        const transactions = await WalletTransaction.create(
          [
            {
              userId,
              type: WalletTransactionType.CREDIT,
              source: input.source,
              amount,
              balanceBefore,
              balanceAfter,
              referenceId: input.referenceId,
              idempotencyKey: input.idempotencyKey,
              description: input.description,
            },
          ],
          { session },
        );

        createdTransaction = transactions[0];
      });
    } finally {
      await session.endSession();
    }

    return createdTransaction;
  }

  async debit(input: IDebitWalletInput) {
    const { userId, amount } = input;

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError("Coin amount must be a positive integer", 400);
    }

    const existingTransaction = await WalletTransaction.findOne({
      idempotencyKey: input.idempotencyKey,
    });

    if (existingTransaction) {
      return existingTransaction;
    }

    let createdTransaction;

    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const wallet = await this.getOrCreateWallet(userId, session);

        if (wallet.balance < amount) {
          throw new AppError("Insufficient wallet balance", 400);
        }

        const balanceBefore = wallet.balance;
        const balanceAfter = balanceBefore - amount;

        wallet.balance = balanceAfter;
        wallet.totalSpent += amount;

        await wallet.save({ session });

        const transactions = await WalletTransaction.create(
          [
            {
              userId,
              type: WalletTransactionType.DEBIT,
              source: input.source,
              amount,
              balanceBefore,
              balanceAfter,
              referenceId: input.referenceId,
              idempotencyKey: input.idempotencyKey,
              description: input.description,
            },
          ],
          { session },
        );

        createdTransaction = transactions[0];
      });
    } finally {
      await session.endSession();
    }

    return createdTransaction;
  }

  async transfer(input: ITransferWalletInput) {
    const { fromUserId, toUserId, amount } = input;

    if (!Types.ObjectId.isValid(fromUserId)) {
      throw new AppError("Invalid sender user ID", 400);
    }

    if (!Types.ObjectId.isValid(toUserId)) {
      throw new AppError("Invalid receiver user ID", 400);
    }

    if (fromUserId.equals(toUserId)) {
      throw new AppError("Cannot transfer coins to yourself", 400);
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new AppError("Coin amount must be a positive integer", 400);
    }

    const existingTransaction = await WalletTransaction.findOne({
      idempotencyKey: `${input.idempotencyKey}:debit`,
    });

    if (existingTransaction) {
      return existingTransaction;
    }

    let createdTransaction;

    const session = await startSession();

    try {
      await session.withTransaction(async () => {
        const senderWallet = await this.getOrCreateWallet(fromUserId, session);

        const receiverWallet = await this.getOrCreateWallet(toUserId, session);

        if (senderWallet.balance < amount) {
          throw new AppError("Insufficient wallet balance", 400);
        }

        const senderBalanceBefore = senderWallet.balance;
        const senderBalanceAfter = senderBalanceBefore - amount;

        const receiverBalanceBefore = receiverWallet.balance;
        const receiverBalanceAfter = receiverBalanceBefore + amount;

        senderWallet.balance = senderBalanceAfter;
        senderWallet.totalSpent += amount;

        receiverWallet.balance = receiverBalanceAfter;
        receiverWallet.totalReceived += amount;

        await senderWallet.save({ session });
        await receiverWallet.save({ session });

        const transactions = await WalletTransaction.create(
          [
            {
              userId: fromUserId,
              type: WalletTransactionType.DEBIT,
              source: input.source,
              amount,
              balanceBefore: senderBalanceBefore,
              balanceAfter: senderBalanceAfter,
              referenceId: input.referenceId,
              idempotencyKey: `${input.idempotencyKey}:debit`,
              description: input.description,
            },
            {
              userId: toUserId,
              type: WalletTransactionType.CREDIT,
              source: input.source,
              amount,
              balanceBefore: receiverBalanceBefore,
              balanceAfter: receiverBalanceAfter,
              referenceId: input.referenceId,
              idempotencyKey: `${input.idempotencyKey}:credit`,
              description: input.description,
            },
          ],
          {
            session,
            ordered: true,
          },
        );

        createdTransaction = transactions[0];
      });
    } finally {
      await session.endSession();
    }
    return createdTransaction;
  }

  async getBalance(userId: Types.ObjectId) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const wallet = await Wallet.findOne({ userId }, { balance: 1 });

    if (!wallet) {
      throw new AppError("Wallet not found", 400);
    }

    return wallet.balance;
  }

  async getTransactions(input: IGetTransactionsInput) {
    const { userId, limit = 20, cursor } = input;

    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const safeLimit = Math.min(Math.max(limit, 1), 50);

    const query: {
      userId: Types.ObjectId;
      createdAt?: { $lt: Date };
    } = {
      userId,
    };

    if (cursor) {
      const cursorDate = new Date(cursor);

      if (Number.isNaN(cursorDate.getTime())) {
        throw new AppError("Invalid cursor", 400);
      }

      query.createdAt = {
        $lt: cursorDate,
      };
    }

    const transactions = await WalletTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(safeLimit + 1)
      .lean();

    const hasNextPage = transactions.length > safeLimit;

    if (hasNextPage) {
      transactions.pop();
    }

    const nextCursor =
      hasNextPage && transactions.length > 0
        ? transactions[transactions.length - 1].createdAt?.toISOString()
        : null;

    return {
      transactions,
      nextCursor,
      hasNextPage,
    };
  }
}

export const walletService = new WalletService();
