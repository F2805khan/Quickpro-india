import express from "express";
import { getBookingMessages } from "../controllers/chatController.js";

const router = express.Router();

router.get("/:bookingId", getBookingMessages);

export default router;
