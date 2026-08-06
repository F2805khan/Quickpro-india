import SupabaseModel from "./SupabaseModel.js";

class Message extends SupabaseModel {
  static get tableName() {
    return "messages";
  }

  static get columnMap() {
    return {
      id: "id",
      bookingId: "booking_id",
      senderId: "sender_id",
      receiverId: "receiver_id",
      content: "content",
      isRead: "is_read",
      createdAt: "created_at"
    };
  }
}

export default Message;
