import { ClientSession, Types, startSession } from "mongoose";
import { Wallet } from "./wallet.model.js";
import {
  ICreditWalletInput,
  IDebitWalletInput,
  ITransferWalletInput,
  IGetTransactionsInput,
} from "./wallet.types.js";
import { WalletTransaction } from "./wallet-transaction.model.js";
import { WalletTransactionSource, WalletTransactionType } from "./wallet.enums.js";
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
      throw new Error("Invalid user ID");
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Coin amount must be a positive integer");
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
      throw new Error("Invalid user ID");
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Coin amount must be a positive integer");
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
          throw new Error("Insufficient wallet balance");
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
      throw new Error("Invalid sender user ID");
    }

    if (!Types.ObjectId.isValid(toUserId)) {
      throw new Error("Invalid receiver user ID");
    }

    if (fromUserId.equals(toUserId)) {
      throw new Error("Cannot transfer coins to yourself");
    }

    if (!Number.isInteger(amount) || amount <= 0) {
      throw new Error("Coin amount must be a positive integer");
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
        const senderWallet = await this.getOrCreateWallet(fromUserId, session);

        const receiverWallet = await this.getOrCreateWallet(toUserId, session);

        if (senderWallet.balance < amount) {
          throw new Error("Insufficient wallet balance");
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
      throw new Error("Invalid user ID");
    }

    const wallet = await Wallet.findOne({ userId }, { balance: 1 });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    return wallet.balance;
  }

  async getTransactions(input: IGetTransactionsInput) {
    const { userId, limit = 20, cursor } = input;

    if (!Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
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
        throw new Error("Invalid cursor");
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
