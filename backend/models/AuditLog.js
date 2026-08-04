import { SupabaseModel } from "./SupabaseModel.js";

class AuditLog extends SupabaseModel {
  static get tableName() {
    return "audit_logs";
  }
}

export default AuditLog;
