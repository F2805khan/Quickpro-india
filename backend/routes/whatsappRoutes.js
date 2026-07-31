import express from "express";
import {
  broadcastMessage,
  getWhatsAppStatus,
  receiveWebhook,
  sendMessage,
  verifyWebhook
} from "../controllers/whatsappController.js";
import { admin, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Public webhook endpoints — called by Meta (WhatsApp Cloud API) */
router.get("/webhook", verifyWebhook);
router.post("/webhook", receiveWebhook);

/* Admin-only management endpoints */
router.get("/status", protect, admin, getWhatsAppStatus);
router.post("/send", protect, admin, sendMessage);
router.post("/broadcast", protect, admin, broadcastMessage);

export default router;
