import express from "express";
import { getLatestLocation } from "../controllers/trackingController.js";

const router = express.Router();

router.get("/:bookingId", getLatestLocation);

export default router;
