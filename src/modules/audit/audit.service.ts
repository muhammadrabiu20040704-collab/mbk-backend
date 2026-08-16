import { AuditLog } from "./audit.model.js";
import { CreateAuditLogInput } from "./audit.types.js";

export class AuditService {
  async createLog(data: CreateAuditLogInput) {
    return AuditLog.create({
      actorUserId: data.actorUserId,
      targetUserId: data.targetUserId,
      action: data.action,
      oldValue: data.oldValue,
      newValue: data.newValue,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
    });
  }
}

export const auditService = new AuditService();
