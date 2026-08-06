import SupabaseModel from "./SupabaseModel.js";

class Earning extends SupabaseModel {
  static get tableName() {
    return "earnings";
  }

  static get columnMap() {
    return {
      id: "id",
      providerId: "provider_id",
      bookingId: "booking_id",
      amount: "amount",
      platformFee: "platform_fee",
      netEarning: "net_earning",
      status: "status",
      createdAt: "created_at",
      updatedAt: "updated_at"
    };
  }
}

export default Earning;
