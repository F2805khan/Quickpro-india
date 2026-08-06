import express from "express";
import { getInvoice } from "../controllers/invoiceController.js";

const router = express.Router();

router.get("/:bookingId", getInvoice);

export default router;
