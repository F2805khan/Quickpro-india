import { Booking, User } from "../models/index.js";

export const getInvoice = async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    // In a real app we'd join Booking, User, and Invoice models.
    // For now we'll fetch the booking and simulate invoice data.
    const bookings = await Booking.find({ id: bookingId });
    if (bookings.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    const booking = bookings[0];
    
    // Mock the invoice line items since we didn't fully build out the service_bundle_items link in Booking
    const invoice = {
      invoiceNumber: `INV-${Math.floor(Math.random() * 100000)}`,
      date: new Date().toISOString().split('T')[0],
      customerName: booking.customerName || "Valued Customer",
      serviceName: booking.serviceName || "Service",
      subtotal: booking.subtotalAmount || booking.amount,
      discount: booking.discountAmount || 0,
      total: booking.amount,
      tax: (booking.amount * 0.18).toFixed(2), // 18% GST mock
      status: booking.paymentStatus
    };

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
};
