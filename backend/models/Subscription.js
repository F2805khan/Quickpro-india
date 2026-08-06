import SupabaseModel from "./SupabaseModel.js";

class Subscription extends SupabaseModel {
  static get tableName() {
    return "subscriptions";
  }

  static get columnMap() {
    return {
      id: "id",
      userId: "user_id",
      planName: "plan_name",
      planType: "plan_type",
      price: "price",
      status: "status",
      startedAt: "started_at",
      expiresAt: "expires_at"
    };
  }
}

export default Subscription;
