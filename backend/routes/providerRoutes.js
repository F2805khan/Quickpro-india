import express from "express";
import { getProviders, getProviderById } from "../controllers/providerController.js";

const router = express.Router();

router.route("/").get(getProviders);
router.route("/:id").get(getProviderById);

export default router;
