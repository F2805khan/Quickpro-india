import SupabaseModel from "./SupabaseModel.js";

class Complaint extends SupabaseModel {
  static get tableName() {
    return "complaints";
  }

  static get columnMap() {
    return {
      id: "id",
      bookingId: "booking_id",
      userId: "user_id",
      reason: "reason",
      description: "description",
      status: "status",
      resolutionNotes: "resolution_notes",
      createdAt: "created_at",
      updatedAt: "updated_at"
    };
  }
}

export default Complaint;
