import { Message } from "../models/index.js";

export const getBookingMessages = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const messages = await Message.find({ bookingId });
    // Assume sorted chronologically if inserted in order
    res.json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
