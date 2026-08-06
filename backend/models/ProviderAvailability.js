import SupabaseModel from "./SupabaseModel.js";

class ProviderAvailability extends SupabaseModel {
  static get tableName() {
    return "provider_availability";
  }

  static get columnMap() {
    return {
      id: "id",
      providerId: "provider_id",
      dayOfWeek: "day_of_week",
      startTime: "start_time",
      endTime: "end_time",
      isActive: "is_active",
      createdAt: "created_at",
      updatedAt: "updated_at"
    };
  }
}

export default ProviderAvailability;
