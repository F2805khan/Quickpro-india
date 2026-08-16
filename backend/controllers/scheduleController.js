import { ProviderAvailability, ProviderServiceArea, Provider, Booking } from "../models/index.js";

export const getAvailableSlots = async (req, res) => {
  try {
    const { date, pincode, serviceId } = req.query;
    if (!date || !pincode) {
      return res.status(400).json({ error: "date and pincode are required" });
    }

    const requestedDate = new Date(date);
    const dayOfWeek = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(requestedDate);

    // Find providers serving this pincode
    const serviceAreas = await ProviderServiceArea.find({ pincode });
    const providerIds = serviceAreas.map((sa) => sa.providerId);

    if (providerIds.length === 0) {
      return res.json({ slots: [], message: "No providers available in this area." });
    }

    // Find availability for these providers on the given day
    const availabilities = await ProviderAvailability.find({ dayOfWeek });
    const availableProviders = availabilities.filter((a) => providerIds.includes(a.providerId) && a.isActive);

    if (availableProviders.length === 0) {
      return res.json({ slots: [], message: "No providers available on this date." });
    }

    // Simplistic slot generation: generate slots from 09:00 to 18:00
    // Real implementation would check `a.startTime` and `a.endTime` and active bookings
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let i = startHour; i < endHour; i += 2) {
      // 2 hour intervals
      const timeString = `${i.toString().padStart(2, "0")}:00`;
      
      // Check if ALL providers are booked for this time (simple mock logic)
      // For now, if there is at least one provider, we assume the slot is open
      slots.push({
        time: timeString,
        available: true
      });
    }

    res.json({ date, pincode, slots });
  } catch (error) {
    console.error("Error getting available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
};
