import { AuditAction } from "./audit.enums.js";

export interface CreateAuditLogInput {
  actorUserId: string;
  targetUserId?: string;
  action: AuditAction;
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
}
