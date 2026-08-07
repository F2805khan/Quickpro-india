export const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");

  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  return digits;
};

const bookingMessage = (booking) =>
  [
    `Quickpro India booking update: ${booking.bookingId}`,
    `Service: ${booking.serviceName}`,
    `Customer: ${booking.customerName}`,
    `Phone: ${booking.phone}`,
    `Address: ${booking.address}`,
    `Slot: ${booking.date} at ${booking.time}`,
    `Professional: ${booking.professionalName}`,
    `ETA: ${booking.estimatedArrival}`
  ].filter(Boolean).join("\n");

const buildPayload = (booking) => ({
  bookingId: booking.bookingId,
  customerName: booking.customerName,
  phone: booking.phone,
  serviceName: booking.serviceName,
  professionalName: booking.professionalName,
  professionalPhoto: booking.professionalPhoto,
  estimatedArrival: booking.estimatedArrival,
  message: bookingMessage(booking)
});

const sendCloudMessage = async ({ to, message }) => {
  const phoneNumberId = process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim();
  const accessToken = process.env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim();
  const version = process.env.WHATSAPP_GRAPH_API_VERSION?.trim() || "v20.0";

  if (!phoneNumberId || !accessToken || !to) return null;

  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: message
      }
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "WhatsApp Cloud API message failed");
  }

  return {
    sent: true,
    provider: "whatsapp-cloud",
    to,
    response: data
  };
};

const sendWebhookMessage = async (payload) => {
  const webhookUrl = process.env.WHATSAPP_AGENT_WEBHOOK_URL?.trim();

  if (!webhookUrl) return null;

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("WhatsApp agent webhook failed");
  }

  return response.json().catch(() => ({ sent: true, provider: "webhook" }));
};

export const isWhatsAppCloudConfigured = () =>
  Boolean(
    process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID?.trim() &&
    process.env.WHATSAPP_CLOUD_ACCESS_TOKEN?.trim()
  );

/**
 * Generic outbound text message. Tries the Cloud API first, then the
 * webhook fallback, otherwise returns a manual wa.me link.
 */
export async function sendWhatsAppText(phone, message) {
  const to = normalizePhone(phone);

  if (!to || !message) {
    return { sent: false, skipped: true, reason: "Phone and message are required" };
  }

  const cloudResult = await sendCloudMessage({ to, message });
  if (cloudResult) return cloudResult;

  const webhookResult = await sendWebhookMessage({ phone: to, message });
  if (webhookResult) return webhookResult;

  return {
    sent: false,
    skipped: true,
    provider: "manual-link",
    whatsappUrl: `https://wa.me/${to}?text=${encodeURIComponent(message)}`,
    reason:
      "Set WHATSAPP_CLOUD_PHONE_NUMBER_ID + WHATSAPP_CLOUD_ACCESS_TOKEN, or WHATSAPP_AGENT_WEBHOOK_URL, to send automatically"
  };
}

const STATUS_LINES = {
  Confirmed: "Your booking is confirmed. We'll assign a professional shortly.",
  "Professional Assigned": "A professional has been assigned to your booking.",
  "On The Way": "Your professional is on the way!",
  "Service In Progress": "Your service is now in progress.",
  Completed: "Your service is complete. Thank you for choosing Quickpro India!",
  Cancelled: "Your booking has been cancelled."
};

const statusMessage = (booking) =>
  [
    `Quickpro India update for booking ${booking.bookingId}`,
    ``,
    STATUS_LINES[booking.bookingStatus] || `Status: ${booking.bookingStatus}`,
    ``,
    `Service: ${booking.serviceName}`,
    booking.professionalName ? `Professional: ${booking.professionalName}` : null,
    booking.estimatedArrival && ["Professional Assigned", "On The Way"].includes(booking.bookingStatus)
      ? `ETA: ${booking.estimatedArrival}`
      : null,
    `Slot: ${booking.date} at ${booking.time}`
  ].filter((line) => line !== null).join("\n");

/** Notify the customer about a booking status change */
export async function notifyBookingStatusUpdate(booking) {
  return sendWhatsAppText(booking.phone, statusMessage(booking));
}

/** Notify the customer that their booking was cancelled */
export async function notifyBookingCancelled(booking) {
  const message = [
    `Quickpro India update for booking ${booking.bookingId}`,
    ``,
    `Your booking for "${booking.serviceName}" on ${booking.date} at ${booking.time} has been cancelled.`,
    ``,
    `If this was a mistake or you'd like to rebook, just reply to this message or visit the app.`
  ].join("\n");

  return sendWhatsAppText(booking.phone, message);
}

export async function notifyWhatsAppAgent(booking) {
  const payload = buildPayload(booking);
  const targetPhone = normalizePhone(process.env.WHATSAPP_AGENT_PHONE || booking.phone);
  const cloudResult = await sendCloudMessage({ to: targetPhone, message: payload.message });

  if (cloudResult) {
    return cloudResult;
  }

  const webhookResult = await sendWebhookMessage(payload);

  if (webhookResult) {
    return webhookResult;
  }

  const whatsappUrl = targetPhone
    ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(payload.message)}`
    : null;

  return {
    skipped: true,
    whatsappUrl,
    provider: "manual-link",
    reason:
      "Set WHATSAPP_CLOUD_PHONE_NUMBER_ID + WHATSAPP_CLOUD_ACCESS_TOKEN, or WHATSAPP_AGENT_WEBHOOK_URL, to send automatically"
  };
}
