import SupabaseModel from "./SupabaseModel.js";

class ProviderLocation extends SupabaseModel {
  static get tableName() {
    return "provider_locations";
  }

  static get columnMap() {
    return {
      id: "id",
      providerId: "provider_id",
      bookingId: "booking_id",
      latitude: "latitude",
      longitude: "longitude",
      heading: "heading",
      speed: "speed",
      recordedAt: "recorded_at"
    };
  }
}

export default ProviderLocation;
