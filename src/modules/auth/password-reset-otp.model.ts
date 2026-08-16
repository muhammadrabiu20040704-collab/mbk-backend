import { Schema, model, Types, Document } from "mongoose";

export interface IPasswordResetOTP extends Document {
  userId: Types.ObjectId;
  otpHash: string;
  channel: "sms" | "email";
  expiresAt: Date;
  usedAt?: Date;
  verifiedAt?: Date;
  createdAt: Date;
}

const passwordResetOTPSchema = new Schema<IPasswordResetOTP>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otpHash: {
      type: String,
      required: true,
    },

    channel: {
      type: String,
      enum: ["sms", "email"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usedAt: {
      type: Date,
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

passwordResetOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordResetOTP = model<IPasswordResetOTP>(
  "PasswordResetOTP",
  passwordResetOTPSchema,
);
