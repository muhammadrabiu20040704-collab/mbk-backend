import { Schema, model } from "mongoose";
import { IWalletTransaction } from "./wallet-transaction.types.js";
import { WalletTransactionSource, WalletTransactionType } from "./wallet.enums.js";

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(WalletTransactionType),
      required: true,
    },

    source: {
      type: String,
      enum: Object.values(WalletTransactionSource),
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    referenceId: {
      type: Schema.Types.ObjectId,
    },

    relatedUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 250,
    },
  },
  {
    timestamps: true,
  },
);

walletTransactionSchema.index({ userId: 1, createdAt: -1 });

walletTransactionSchema.index({
  userId: 1,
  source: 1,
  createdAt: -1,
});

export const WalletTransaction = model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema,
);
