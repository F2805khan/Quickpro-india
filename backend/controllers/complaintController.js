import { Complaint } from "../models/index.js";

export const submitComplaint = async (req, res) => {
  try {
    const { bookingId, userId, reason, description } = req.body;
    
    const complaint = await Complaint.create({
      bookingId,
      userId,
      reason,
      description,
      status: "open"
    });

    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: "Failed to submit complaint" });
  }
};
