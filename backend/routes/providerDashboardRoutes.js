import express from "express";
import { getProviderJobs, acceptJob, getEarnings, toggleOnlineStatus, getOnlineStatus } from "../controllers/providerDashboardController.js";

const router = express.Router();

router.get("/:providerId/jobs", getProviderJobs);
router.post("/jobs/:bookingId/accept", acceptJob);
router.get("/:providerId/earnings", getEarnings);
router.get("/:providerId/online-status", getOnlineStatus);
router.put("/:providerId/online-status", toggleOnlineStatus);

export default router;
