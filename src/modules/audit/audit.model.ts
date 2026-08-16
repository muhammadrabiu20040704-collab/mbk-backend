import { Schema, model, Types, Document } from "mongoose";
import { AuditAction } from "./audit.enums.js";

export interface IAuditLog extends Document {
  actorUserId: Types.ObjectId;
  targetUserId?: Types.ObjectId;
  action: AuditAction;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    action: {
      type: String,
      enum: Object.values(AuditAction),
      required: true,
    },

    oldValue: {
      type: String,
    },

    newValue: {
      type: String,
    },

    ipAddress: {
      type: String,
      required: true,
    },

    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  },
);

export const AuditLog = model<IAuditLog>("AuditLog", auditLogSchema);
