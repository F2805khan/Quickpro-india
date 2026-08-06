import { ProviderLocation } from "../models/index.js";

export const getLatestLocation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // In a real app, you'd sort by recordedAt DESC. With Supabase, we could do .find with custom ordering,
    // but for this MVP, we fetch all and grab the last one.
    const locations = await ProviderLocation.find({ bookingId });
    if (locations.length === 0) {
      return res.status(404).json({ error: "Location not found" });
    }
    
    const latest = locations[locations.length - 1];
    res.json(latest);
  } catch (error) {
    console.error("Error getting latest location:", error);
    res.status(500).json({ error: "Failed to get location" });
  }
};
