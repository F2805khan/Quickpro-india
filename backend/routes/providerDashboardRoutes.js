import express from "express";
import { getProviderJobs, acceptJob, getEarnings } from "../controllers/providerDashboardController.js";

const router = express.Router();

router.get("/:providerId/jobs", getProviderJobs);
router.post("/jobs/:bookingId/accept", acceptJob);
router.get("/:providerId/earnings", getEarnings);

export default router;
