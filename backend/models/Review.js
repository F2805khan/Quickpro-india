import { SupabaseModel } from "./SupabaseModel.js";

class Review extends SupabaseModel {
  static get tableName() {
    return "reviews";
  }

  static get columnMap() {
    return {
      bookingId: "booking_id",
      userId: "user_id",
      providerId: "provider_id",
      serviceId: "service_id",
      rating: "rating",
      comment: "comment"
    };
  }
}

export default Review;
