import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
import "./config/env.js";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import databaseRoutes from "./routes/databaseRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import imageRoutes from "./routes/imageRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import providerDashboardRoutes from "./routes/providerDashboardRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
import ensureAdminUser from "./utils/ensureAdminUser.js";
import { isEmailDeliveryConfigured } from "./utils/email.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminDistPath = path.resolve(__dirname, "./admin/dist");

const app = express();
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [];

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api", (req, res) => {
  res.json({
    name: "Quickpro India API",
    tagline: "All Services. One Click.",
    health: "ok"
  });
});

app.get("/api/health", async (req, res) => {
  res.json({
    ok: true,
    database: "supabase",
    emailDelivery: isEmailDeliveryConfigured() ? "configured" : "not-configured"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/provider-dashboard", providerDashboardRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/admin/database", databaseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/images", imageRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/events", eventRoutes);

app.use(express.static(adminDistPath));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  return res.sendFile(path.join(adminDistPath, "index.html"), (error) => {
    if (error) next(error);
  });
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  await ensureAdminUser();
  if (!isEmailDeliveryConfigured()) {
    console.warn("Resend email delivery is disabled. Set RESEND_API_KEY in backend/.env and restart the backend.");
  }
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins.length ? allowedOrigins : true,
      credentials: true
    }
  });
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("Client connected via socket:", socket.id);

    // Join a specific booking room for isolated communication
    socket.on("join_booking", (bookingId) => {
      socket.join(bookingId);
      console.log(`Socket ${socket.id} joined booking ${bookingId}`);
    });

    // Handle incoming chat messages
    socket.on("send_message", async (data) => {
      const { bookingId, senderId, receiverId, content } = data;
      // In production, we'd save it to the DB here using Message model
      // Then broadcast it to the room
      io.to(bookingId).emit("receive_message", { senderId, content, timestamp: new Date() });
    });

    // Handle provider location updates
    socket.on("location_update", async (data) => {
      const { bookingId, providerId, latitude, longitude } = data;
      // In production, we'd throttle and save to ProviderLocation DB
      io.to(bookingId).emit("location_changed", { latitude, longitude, timestamp: new Date() });
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`Quickpro India API running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
