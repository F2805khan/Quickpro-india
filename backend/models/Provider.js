import { SupabaseModel } from "./SupabaseModel.js";

class Provider extends SupabaseModel {
  static get tableName() {
    return "providers";
  }

  static get columnMap() {
    return {
      userId: "user_id",
      companyName: "company_name",
      bio: "bio",
      isVerified: "is_verified",
      yearsExperience: "years_experience",
      ratingAvg: "rating_avg",
      ratingCount: "rating_count"
    };
  }
}

export default Provider;
