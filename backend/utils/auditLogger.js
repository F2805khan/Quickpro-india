import { AuditLog } from "../models/index.js";

export const logAuditAction = async (action, entityType, entityId, adminUser, details = {}) => {
  try {
    await AuditLog.create({
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      actor_id: adminUser?.id || "system",
      details
    });
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
};
