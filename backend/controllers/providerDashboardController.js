import { Booking, Provider, Earning } from "../models/index.js";

export const getProviderJobs = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { status } = req.query; // 'Pending', 'Accepted', 'Completed'
    
    const query = { providerId };
    if (status) query.assignmentStatus = status;

    const jobs = await Booking.find(query);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching provider jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

export const acceptJob = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { providerId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.assignmentStatus !== 'Pending') {
      return res.status(400).json({ error: `Booking is already ${booking.assignmentStatus}` });
    }

    booking.assignmentStatus = 'Accepted';
    booking.providerId = providerId;
    // update status to Confirmed
    booking.status = 'Confirmed';
    
    await booking.save();
    res.json({ message: "Job accepted successfully", booking });
  } catch (error) {
    console.error("Error accepting job:", error);
    res.status(500).json({ error: "Failed to accept job" });
  }
};

export const getEarnings = async (req, res) => {
  try {
    const { providerId } = req.params;
    const earnings = await Earning.find({ providerId });
    
    const totalEarned = earnings.reduce((sum, e) => sum + Number(e.netEarning), 0);
    const totalPending = earnings.filter(e => e.status === 'Pending').reduce((sum, e) => sum + Number(e.netEarning), 0);
    
    res.json({
      earnings,
      summary: {
        totalEarned,
        totalPending
      }
    });
  } catch (error) {
    console.error("Error fetching earnings:", error);
    res.status(500).json({ error: "Failed to fetch earnings" });
  }
};
