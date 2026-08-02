import { SupabaseModel } from "./SupabaseModel.js";

class Agent extends SupabaseModel {
  static get tableName() {
    return "agents";
  }
}

export default Agent;
