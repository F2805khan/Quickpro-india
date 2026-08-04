import { SupabaseModel } from "./SupabaseModel.js";

class AdminAlert extends SupabaseModel {
  static get tableName() {
    return "admin_alerts";
  }
}

export default AdminAlert;
