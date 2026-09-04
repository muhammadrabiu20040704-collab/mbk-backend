import { Types } from "mongoose";
import { WalletTransactionSource, WalletTransactionType } from "./wallet.enums.js";

export interface IWalletTransaction {
  userId: Types.ObjectId;

  type: WalletTransactionType;

  source: WalletTransactionSource;

  amount: number;

  balanceBefore: number;

  balanceAfter: number;

  referenceId?: Types.ObjectId;

  relatedUserId?: Types.ObjectId;

  idempotencyKey: string;

  description?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
