import { Types } from "mongoose";
import { WalletTransactionSource } from "./wallet.enums.js";

export interface IWallet {
  userId: Types.ObjectId;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  totalReceived: number;
}

export interface ICreditWalletInput {
  userId: Types.ObjectId;
  amount: number;
  source: WalletTransactionSource;
  referenceId?: Types.ObjectId;
  idempotencyKey: string;
  description?: string;
}

export interface IDebitWalletInput {
  userId: Types.ObjectId;
  amount: number;
  source: WalletTransactionSource;
  referenceId?: Types.ObjectId;
  idempotencyKey: string;
  description?: string;
}

export interface ITransferWalletInput {
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  amount: number;
  source: WalletTransactionSource;
  referenceId?: Types.ObjectId;
  idempotencyKey: string;
  description?: string;
}

export interface IGetTransactionsInput {
  userId: Types.ObjectId;
  limit?: number;
  cursor?: string;
}
