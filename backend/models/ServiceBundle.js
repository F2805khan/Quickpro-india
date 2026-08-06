import { SupabaseModel } from "./SupabaseModel.js";

class ServiceBundle extends SupabaseModel {
  static get tableName() {
    return "service_bundles";
  }

  static get columnMap() {
    return {
      name: "name",
      description: "description",
      price: "price",
      image: "image_url",
      isActive: "is_active"
    };
  }
}

export default ServiceBundle;
