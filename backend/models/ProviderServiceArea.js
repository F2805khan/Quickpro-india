import SupabaseModel from "./SupabaseModel.js";

class ProviderServiceArea extends SupabaseModel {
  static get tableName() {
    return "provider_service_areas";
  }

  static get columnMap() {
    return {
      id: "id",
      providerId: "provider_id",
      pincode: "pincode",
      city: "city",
      createdAt: "created_at"
    };
  }
}

export default ProviderServiceArea;
