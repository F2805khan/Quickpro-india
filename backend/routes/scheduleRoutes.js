import express from "express";
import { getAvailableSlots } from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/slots", getAvailableSlots);

export default router;
