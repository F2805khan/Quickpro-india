import express from "express";
import { sendReviewConfirmation, createReview, getReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.route("/").post(createReview).get(getReviews);
router.post("/confirmation", sendReviewConfirmation);

export default router;
