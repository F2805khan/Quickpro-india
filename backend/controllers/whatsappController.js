import asyncHandler from "../middleware/asyncHandler.js";
import Booking from "../models/Booking.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import { Op } from "../utils/sequelizeMock.js";
import {
  isWhatsAppCloudConfigured,
  normalizePhone,
  sendWhatsAppText
} from "../utils/whatsappAgent.js";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const BOOKING_ID_RE = /#?QF\d{6}/i;

/* Meta retries webhook deliveries — remember recent message ids to avoid double replies */
const processedMessageIds = new Set();
const rememberMessageId = (id) => {
  if (!id) return false;
  if (processedMessageIds.has(id)) return true;
  processedMessageIds.add(id);
  if (processedMessageIds.size > 500) {
    const oldest = processedMessageIds.values().next().value;
    processedMessageIds.delete(oldest);
  }
  return false;
};

const phoneVariants = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  const variants = new Set([digits]);
  if (digits.length > 10) variants.add(digits.slice(-10));
  if (digits.length === 10) variants.add(`91${digits}`);
  return [...variants].filter(Boolean);
};

const findBookingsByPhone = async (phone, limit = 3) => {
  const variants = phoneVariants(phone);
  if (!variants.length) return [];

  return Booking.findAll({
    where: { [Op.or]: variants.map((value) => ({ phone: value })) },
    order: [["createdAt", "DESC"]],
    limit
  });
};

const bookingSummaryLine = (booking) =>
  `• ${booking.bookingId} — ${booking.serviceName} on ${booking.date} at ${booking.time} [${booking.bookingStatus}]`;

const bookingDetailMessage = (booking) =>
  [
    `Booking ${booking.bookingId}`,
    `Service: ${booking.serviceName}`,
    `Status: ${booking.bookingStatus}`,
    `Slot: ${booking.date} at ${booking.time}`,
    booking.professionalName ? `Professional: ${booking.professionalName}` : null,
    booking.estimatedArrival ? `ETA: ${booking.estimatedArrival}` : null,
    `Amount: ₹${booking.amount}`,
    `Payment: ${booking.paymentMethod} (${booking.paymentStatus})`
  ].filter(Boolean).join("\n");

const MENU_MESSAGE = [
  "Hi! I'm the Quickpro India assistant. I can help you with:",
  "",
  '• "status" — check your recent bookings',
  '• "status QF123456" — check a specific booking',
  '• "services" — see popular services and prices',
  '• "help" — talk to our support team',
  "",
  "What would you like to do?"
].join("\n");

/* ------------------------------------------------------------------ */
/*  Optional AI replies via the Claude API                             */
/* ------------------------------------------------------------------ */

const isAiConfigured = () => Boolean(process.env.ANTHROPIC_API_KEY?.trim());

const buildAiContext = async (phone) => {
  const [bookings, services] = await Promise.all([
    findBookingsByPhone(phone, 5).catch(() => []),
    Service.findAll({ where: { enabled: true }, limit: 15 }).catch(() => [])
  ]);

  return [
    "Business: Quickpro India — home services booking platform in India (repairs, cleaning, beauty, and more). Tagline: All Services. One Click.",
    "",
    "Customer's recent bookings:",
    bookings.length ? bookings.map(bookingSummaryLine).join("\n") : "(none found for this phone number)",
    "",
    "Available services:",
    services.length
      ? services.map((service) => `• ${service.title} — ₹${service.price}`).join("\n")
      : "(service list unavailable)"
  ].join("\n");
};

const generateAiReply = async (phone, text) => {
  const context = await buildAiContext(phone);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY.trim(),
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.WHATSAPP_AI_MODEL?.trim() || "claude-3-5-haiku-latest",
      max_tokens: 300,
      system: [
        "You are the WhatsApp support assistant for Quickpro India.",
        "Reply in short, friendly plain text suitable for WhatsApp (no markdown).",
        "Only answer using the context provided. If you don't know something,",
        "ask the customer to contact support through the app.",
        "Never invent booking details, prices, or policies.",
        "",
        context
      ].join("\n")
    ,
      messages: [{ role: "user", content: text }]
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error?.message || "Claude API request failed");
  }

  const reply = data.content?.find((block) => block.type === "text")?.text?.trim();
  return reply || null;
};

/* ------------------------------------------------------------------ */
/*  Reply engine (rule-based first, AI fallback)                       */
/* ------------------------------------------------------------------ */

export const buildReply = async (phone, rawText) => {
  const text = String(rawText || "").trim();
  const lower = text.toLowerCase();

  /* Specific booking id anywhere in the message */
  const idMatch = text.match(BOOKING_ID_RE);
  if (idMatch) {
    const bookingId = idMatch[0].startsWith("#") ? idMatch[0] : `#${idMatch[0]}`;
    const booking = await Booking.findOne({ where: { bookingId: bookingId.toUpperCase() } });
    return booking
      ? bookingDetailMessage(booking)
      : `I couldn't find booking ${bookingId.toUpperCase()}. Please double-check the booking ID.`;
  }

  /* Booking status for this phone number */
  if (/\b(status|booking|order|track)\b/.test(lower)) {
    const bookings = await findBookingsByPhone(phone);
    if (!bookings.length) {
      return "I couldn't find any bookings for this number. If you booked with a different number, send the booking ID (e.g. QF123456).";
    }
    return ["Your recent bookings:", "", ...bookings.map(bookingSummaryLine), "", "Send a booking ID for full details."].join("\n");
  }

  /* Services and pricing */
  if (/\b(service|services|price|prices|book|rate|menu)\b/.test(lower)) {
    const services = await Service.findAll({ where: { enabled: true }, limit: 8 });
    if (!services.length) {
      return "Our service list is being updated. Please check the Quickpro India app for the latest services.";
    }
    return [
      "Popular Quickpro India services:",
      "",
      ...services.map((service) => `• ${service.title} — ₹${service.price}`),
      "",
      "Book any service in the Quickpro India app!"
    ].join("\n");
  }

  /* Support */
  if (/\b(help|support|complaint|issue|problem|refund)\b/.test(lower)) {
    return [
      "Sorry to hear you need help! You can:",
      "",
      "• Reply here with your booking ID and issue",
      "• Use the Support section in the Quickpro India app",
      "",
      "Our team will get back to you as soon as possible."
    ].join("\n");
  }

  /* Greetings */
  if (/^(hi|hii+|hello|hey|namaste|hola)\b/.test(lower) || !text) {
    return MENU_MESSAGE;
  }

  /* Anything else → AI if configured, otherwise show the menu */
  if (isAiConfigured()) {
    try {
      const aiReply = await generateAiReply(phone, text);
      if (aiReply) return aiReply;
    } catch (error) {
      console.error("WhatsApp AI reply failed:", error.message);
    }
  }

  return MENU_MESSAGE;
};

/* ------------------------------------------------------------------ */
/*  GET /api/whatsapp/webhook — Meta verification handshake            */
/* ------------------------------------------------------------------ */

export const verifyWebhook = (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim();

  if (mode === "subscribe" && expected && token === expected) {
    res.status(200).send(challenge);
    return;
  }

  res.sendStatus(403);
};

/* ------------------------------------------------------------------ */
/*  POST /api/whatsapp/webhook — incoming messages                     */
/* ------------------------------------------------------------------ */

const extractIncomingMessages = (body) => {
  const messages = [];
  for (const entry of body?.entry || []) {
    for (const change of entry.changes || []) {
      for (const message of change.value?.messages || []) {
        if (message.type === "text" && message.from && message.text?.body) {
          messages.push({ id: message.id, from: message.from, text: message.text.body });
        }
      }
    }
  }
  return messages;
};

export const receiveWebhook = asyncHandler(async (req, res) => {
  /* Always acknowledge fast — Meta retries anything that isn't a 200 */
  res.sendStatus(200);

  const messages = extractIncomingMessages(req.body);

  for (const message of messages) {
    if (rememberMessageId(message.id)) continue;

    try {
      const reply = await buildReply(message.from, message.text);
      if (reply) {
        await sendWhatsAppText(message.from, reply);
      }
    } catch (error) {
      console.error("WhatsApp auto-reply failed:", error.message);
    }
  }
});

/* ------------------------------------------------------------------ */
/*  GET /api/whatsapp/status — admin: config overview                  */
/* ------------------------------------------------------------------ */

export const getWhatsAppStatus = asyncHandler(async (req, res) => {
  res.json({
    cloudApi: isWhatsAppCloudConfigured() ? "configured" : "not-configured",
    webhookFallback: process.env.WHATSAPP_AGENT_WEBHOOK_URL?.trim() ? "configured" : "not-configured",
    incomingWebhook: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN?.trim() ? "configured" : "not-configured",
    aiReplies: isAiConfigured() ? "configured" : "not-configured",
    aiModel: isAiConfigured() ? process.env.WHATSAPP_AI_MODEL?.trim() || "claude-3-5-haiku-latest" : null
  });
});

/* ------------------------------------------------------------------ */
/*  POST /api/whatsapp/send — admin: send a single message             */
/* ------------------------------------------------------------------ */

export const sendMessage = asyncHandler(async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    res.status(400);
    throw new Error('"to" (phone) and "message" are required');
  }

  const result = await sendWhatsAppText(to, message);
  res.json(result);
});

/* ------------------------------------------------------------------ */
/*  POST /api/whatsapp/broadcast — admin: bulk message                 */
/*  Body: { message, phones?: string[], limit?: number }               */
/*  Without "phones", broadcasts to all customer accounts with phones. */
/* ------------------------------------------------------------------ */

const BROADCAST_DELAY_MS = 400;
const BROADCAST_DEFAULT_LIMIT = 50;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const broadcastMessage = asyncHandler(async (req, res) => {
  const { message, phones } = req.body;
  const limit = Math.min(500, Math.max(1, parseInt(req.body.limit, 10) || BROADCAST_DEFAULT_LIMIT));

  if (!message) {
    res.status(400);
    throw new Error('"message" is required');
  }

  if (!isWhatsAppCloudConfigured() && !process.env.WHATSAPP_AGENT_WEBHOOK_URL?.trim()) {
    res.status(400);
    throw new Error("Configure the WhatsApp Cloud API (or webhook fallback) before broadcasting");
  }

  let targets = [];

  if (Array.isArray(phones) && phones.length) {
    targets = phones;
  } else {
    const users = await User.findAll({
      where: { role: { [Op.notIn]: ["admin", "owner"] } },
      attributes: ["_id", "phone"]
    });
    targets = users.map((user) => user.phone).filter(Boolean);
  }

  /* De-duplicate after normalization and apply the safety cap */
  const uniqueTargets = [...new Set(targets.map(normalizePhone).filter(Boolean))].slice(0, limit);

  const results = { requested: targets.length, attempted: uniqueTargets.length, sent: 0, failed: 0, failures: [] };

  for (const phone of uniqueTargets) {
    try {
      const outcome = await sendWhatsAppText(phone, message);
      if (outcome?.sent) {
        results.sent += 1;
      } else {
        results.failed += 1;
        results.failures.push({ phone, reason: outcome?.reason || "not sent" });
      }
    } catch (error) {
      results.failed += 1;
      results.failures.push({ phone, reason: error.message });
    }
    await sleep(BROADCAST_DELAY_MS);
  }

  /* Keep the failures list small in the response */
  results.failures = results.failures.slice(0, 20);

  res.json(results);
});
